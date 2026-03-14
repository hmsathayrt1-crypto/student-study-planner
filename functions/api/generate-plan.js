/**
 * Student Study Planner - Cloudflare Worker API
 * Multi-Model AI Integration - Different models for different tasks
 */

// Model Configuration
const MODELS = {
  // Fast/cheap model for simple quizzes and quick tasks
  fast: 'minimax/minimax-m2.5',
  // Complex model for study plans
  complex: 'zai-org/glm-5',
  // Creative model for mind maps
  creative: 'moonshotai/kimi-k2.5',
  // Fallback model
  fallback: 'moonshotai/kimi-k2.5'
};

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Parse request body
    const body = await request.json();
    const { 
      studyMaterials, 
      deadline, 
      dailyHours, 
      language = 'en',
      task = 'plan' // 'plan', 'quiz', 'mindmap', 'feedback'
    } = body;
    
    // Validate input
    if (!studyMaterials) {
      return new Response(
        JSON.stringify({ error: language === 'ar' ? 'المواد الدراسية مطلوبة' : 'Study materials are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    let result;
    
    // Route to appropriate handler based on task
    switch (task) {
      case 'plan':
        result = await generateStudyPlan(studyMaterials, deadline, dailyHours, language, env.NANOGPT_API_KEY);
        break;
      case 'quiz':
        result = await generateQuiz(studyMaterials, language, env.NANOGPT_API_KEY);
        break;
      case 'mindmap':
        result = await generateMindMap(studyMaterials, language, env.NANOGPT_API_KEY);
        break;
      case 'feedback':
        result = await analyzeFeedback(studyMaterials, language, env.NANOGPT_API_KEY);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid task type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        task: task,
        model: result.model,
        ...result.data
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
    console.error('Error:', error);
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
 * Generate study plan using GLM-5 (complex model)
 */
async function generateStudyPlan(studyMaterials, deadline, dailyHours, language, apiKey) {
  const isArabic = language === 'ar';
  
  // Calculate dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeadline < 1) {
    throw new Error(isArabic ? 'الموعد يجب أن يكون في المستقبل' : 'Deadline must be in the future');
  }
  
  const actualDays = Math.min(daysUntilDeadline, 90);
  const totalMinutes = dailyHours * 60;
  const dates = [];
  
  for (let i = 0; i < actualDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  const prompt = isArabic 
    ? createArabicPlanPrompt(studyMaterials, actualDays, dailyHours, dates, totalMinutes)
    : createEnglishPlanPrompt(studyMaterials, actualDays, dailyHours, dates, totalMinutes);
  
  const systemMessage = isArabic
    ? 'أنت مخطط تعليمي خبير. أنشئ خطط دراسية يومية مفصلة. يجب أن تكون الإجابة باللغة العربية فقط.'
    : 'You are an expert educational planner. Create detailed day-by-day study plans.';
  
  const response = await callNanoGPT(MODELS.complex, systemMessage, prompt, apiKey);
  
  const content = extractJSON(response);
  const studyPlan = JSON.parse(content);
  
  // Fix dates if needed
  if (studyPlan.schedule && Array.isArray(studyPlan.schedule)) {
    studyPlan.schedule = studyPlan.schedule.map((day, index) => {
      if (!day.date || day.date === 'undefined' || day.date === 'null') {
        day.date = dates[index] || dates[dates.length - 1];
      }
      return day;
    });
  }
  
  return {
    model: MODELS.complex,
    data: {
      totalDays: actualDays,
      totalHours: actualDays * dailyHours,
      deadline: deadline,
      language: language,
      ...studyPlan
    }
  };
}

/**
 * Generate quiz using Minimax M2.5 (fast model)
 */
async function generateQuiz(studyMaterials, language, apiKey) {
  const isArabic = language === 'ar';
  
  const prompt = isArabic
    ? `بناءً على المواد الدراسية التالية، أنشئ 3-5 أسئلة اختيار من متعدد للمراجعة:

${studyMaterials}

أعد JSON بالتنسيق التالي فقط:
{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"],
      "correct": 0,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}

مهم: الإجابة بالعربية فقط.`
    : `Based on the following study materials, create 3-5 multiple choice quiz questions:

${studyMaterials}

Return ONLY JSON in this format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explanation of correct answer"
    }
  ]
}`;

  const systemMessage = isArabic
    ? 'أنت معلم متخصص في إعداد الاختبارات. أنشئ أسئلة واضحة ومناسبة للمستوى.'
    : 'You are a teacher specialized in creating assessments. Create clear, level-appropriate questions.';
  
  const response = await callNanoGPT(MODELS.fast, systemMessage, prompt, apiKey);
  
  const content = extractJSON(response);
  const quiz = JSON.parse(content);
  
  return {
    model: MODELS.fast,
    data: quiz
  };
}

/**
 * Generate mind map using Kimi K2.5 (creative model)
 */
async function generateMindMap(studyMaterials, language, apiKey) {
  const isArabic = language === 'ar';
  
  const prompt = isArabic
    ? `بناءً على المواد الدراسية التالية، أنشئ هيكل خريطة ذهنية تفاعلية:

${studyMaterials}

أعد JSON بالتنسيق التالي:
{
  "centralTopic": "الموضوع الرئيسي",
  "branches": [
    {
      "title": "فرع رئيسي",
      "color": "#6366f1",
      "subBranches": [
        {"title": "فرع فرعي", "description": "وصف مختصر"}
      ]
    }
  ]
}

الإجابة بالعربية فقط.`
    : `Based on the following study materials, create an interactive mind map structure:

${studyMaterials}

Return JSON in this format:
{
  "centralTopic": "Main Topic",
  "branches": [
    {
      "title": "Main Branch",
      "color": "#6366f1",
      "subBranches": [
        {"title": "Sub-branch", "description": "Brief description"}
      ]
    }
  ]
}`;

  const systemMessage = isArabic
    ? 'أنت خبير في تصميم الخرائط الذهنية. أنشئ هيكلاً بصرياً يساعد على الفهم والحفظ.'
    : 'You are a mind mapping expert. Create visual structures that aid understanding and memorization.';
  
  const response = await callNanoGPT(MODELS.creative, systemMessage, prompt, apiKey);
  
  const content = extractJSON(response);
  const mindMap = JSON.parse(content);
  
  return {
    model: MODELS.creative,
    data: mindMap
  };
}

/**
 * Analyze student feedback using fast model
 */
async function analyzeFeedback(feedback, language, apiKey) {
  const isArabic = language === 'ar';
  
  const prompt = isArabic
    ? `حلل التقييم التالي للطالب وقدم اقتراحات مختصرة:

${feedback}

أعد JSON:
{
  "understanding": "مستوى الفهم (عالي/متوسط/منخفض)",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "weaknesses": ["نقطة ضعف 1"],
  "suggestions": ["اقتراح 1", "اقتراح 2"],
  "encouragement": "جملة تشجيعية"
}`
    : `Analyze the following student feedback and provide brief suggestions:

${feedback}

Return JSON:
{
  "understanding": "Understanding level (High/Medium/Low)",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "encouragement": "Encouraging message"
}`;

  const systemMessage = 'You are a supportive educational coach. Provide constructive analysis.';
  
  const response = await callNanoGPT(MODELS.fast, systemMessage, prompt, apiKey);
  
  const content = extractJSON(response);
  const analysis = JSON.parse(content);
  
  return {
    model: MODELS.fast,
    data: analysis
  };
}

/**
 * Call NanoGPT API
 */
async function callNanoGPT(model, systemMessage, userMessage, apiKey) {
  const response = await fetch('https://nano-gpt.com/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from API');
  }
  
  return data.choices[0].message.content;
}

/**
 * Extract JSON from response
 */
function extractJSON(content) {
  // Try to extract JSON from code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1];
  }
  
  // Try to find JSON object
  const objectMatch = content.match(/(\{[\s\S]*\})/);
  if (objectMatch) {
    return objectMatch[1];
  }
  
  return content;
}

/**
 * Create English plan prompt
 */
function createEnglishPlanPrompt(studyMaterials, days, dailyHours, dates, totalMinutes) {
  return `Create a detailed study plan based on the following materials.

STUDY MATERIALS:
${studyMaterials}

CONSTRAINTS:
- Days available: ${days}
- Daily study time: ${dailyHours} hours (${totalMinutes} minutes)
- Total hours: ${days * dailyHours}

DATES LIST (USE THESE EXACT DATES):
${dates.map((d, i) => `Day ${i + 1}: ${d}`).join('\n')}

Return ONLY a JSON object:
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

All text must be in English only.`;
}

/**
 * Create Arabic plan prompt
 */
function createArabicPlanPrompt(studyMaterials, days, dailyHours, dates, totalMinutes) {
  return `أنشئ خطة دراسية مفصلة بناءً على المواد التالية.

المواد الدراسية:
${studyMaterials}

القيود:
- عدد الأيام المتاحة: ${days}
- وقت الدراسة اليومي: ${dailyHours} ساعات (${totalMinutes} دقيقة)
- إجمالي الساعات: ${days * dailyHours}

التواريخ (استخدم هذه بالضبط):
${dates.map((d, i) => `اليوم ${i + 1}: ${d}`).join('\n')}

أعد JSON فقط:
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

يجب أن يكون كل النص بالعربية فقط.`;
}
