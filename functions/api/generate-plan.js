/**
 * Student Study Planner - Cloudflare Worker API
 * Generates study plans using NanoGPT AI - Supports English and Arabic
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Parse request body
    const body = await request.json();
    const { studyMaterials, deadline, dailyHours, language = 'en' } = body;
    
    // Validate input
    if (!studyMaterials || !deadline) {
      return new Response(
        JSON.stringify({ error: language === 'ar' ? 'الحقول المطلوبة مفقودة' : 'Missing required fields: studyMaterials and deadline are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate days until deadline
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 1) {
      return new Response(
        JSON.stringify({ error: language === 'ar' ? 'الموعد يجب أن يكون في المستقبل' : 'Deadline must be in the future' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate study plan using NanoGPT
    const studyPlan = await generateStudyPlanWithAI(
      studyMaterials,
      daysUntilDeadline,
      dailyHours || 3,
      language,
      env.NANOGPT_API_KEY
    );
    
    // Return the generated plan
    return new Response(
      JSON.stringify({
        success: true,
        totalDays: daysUntilDeadline,
        totalHours: daysUntilDeadline * (dailyHours || 3),
        deadline: deadline,
        language: language,
        ...studyPlan
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
    
  } catch (error) {
    console.error('Error generating study plan:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

/**
 * Generate study plan using NanoGPT AI API
 */
async function generateStudyPlanWithAI(studyMaterials, daysUntilDeadline, dailyHours, language, apiKey) {
  const isArabic = language === 'ar';
  
  // Calculate dates
  const totalMinutes = dailyHours * 60;
  const today = new Date();
  const dates = [];
  
  for (let i = 0; i < daysUntilDeadline; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // Create appropriate prompt based on language
  const userMessage = isArabic 
    ? createArabicPrompt(studyMaterials, daysUntilDeadline, dailyHours, dates)
    : createEnglishPrompt(studyMaterials, daysUntilDeadline, dailyHours, dates);
  
  const systemMessage = isArabic
    ? 'أنت مخطط تعليمي خبير. أنشئ خطط دراسية يومية مفصلة. يجب أن تكون الإجابة باللغة العربية فقط. استخدم JSON format.'
    : 'You are an expert educational planner. Create detailed day-by-day study plans. Respond in English only. Use JSON format.';
  
  // Call NanoGPT API without JSON schema for better language support
  const response = await fetch('https://nano-gpt.com/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2.5',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NanoGPT API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from NanoGPT API');
  }
  
  // Parse the JSON content
  let content = data.choices[0].message.content;
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    content = jsonMatch[1];
  }
  
  // Try to find JSON object if still wrapped
  const objectMatch = content.match(/(\{[\s\S]*\})/);
  if (objectMatch) {
    content = objectMatch[1];
  }
  
  try {
    const studyPlan = JSON.parse(content);
    return studyPlan;
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Content received:', content.substring(0, 500));
    throw new Error(isArabic ? 'فشل في معالجة الرد' : 'Failed to parse AI response');
  }
}

/**
 * Create English prompt
 */
function createEnglishPrompt(studyMaterials, daysUntilDeadline, dailyHours, dates) {
  const totalMinutes = dailyHours * 60;
  
  return `Create a detailed study plan based on the following materials.

STUDY MATERIALS:
${studyMaterials}

CONSTRAINTS:
- Days available: ${daysUntilDeadline}
- Daily study time: ${dailyHours} hours (${totalMinutes} minutes)
- Total hours: ${daysUntilDeadline * dailyHours}

DATES: ${dates.join(', ')}

Return ONLY a JSON object in this exact format:
{
  "summary": "detailed summary in English",
  "schedule": [
    {
      "day": "Day 1",
      "date": "${dates[0]}",
      "topics": ["topic 1", "topic 2"],
      "tasks": [{"description": "task description", "duration": 30}]
    }
  ]
}

All text must be in English.`;
}

/**
 * Create Arabic prompt
 */
function createArabicPrompt(studyMaterials, daysUntilDeadline, dailyHours, dates) {
  const totalMinutes = dailyHours * 60;
  
  return `أنشئ خطة دراسية مفصلة بناءً على المواد التالية.

المواد الدراسية:
${studyMaterials}

القيود:
- عدد الأيام المتاحة: ${daysUntilDeadline}
- وقت الدراسة اليومي: ${dailyHours} ساعات (${totalMinutes} دقيقة)
- إجمالي الساعات: ${daysUntilDeadline * dailyHours}

التواريخ: ${dates.join(', ')}

أعد JSON object فقط بهذا التنسيق:
{
  "summary": "ملخص تفصيلي بالعربية",
  "schedule": [
    {
      "day": "اليوم 1",
      "date": "${dates[0]}",
      "topics": ["الموضوع 1", "الموضوع 2"],
      "tasks": [{"description": "وصف المهمة", "duration": 30}]
    }
  ]
}

يجب أن يكون كل النص باللغة العربية فقط.`;
}
