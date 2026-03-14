/**
 * Student Study Planner - Cloudflare Worker API
 * Generates study plans using NanoGPT AI
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Parse request body
    const body = await request.json();
    const { studyMaterials, deadline, dailyHours } = body;
    
    // Validate input
    if (!studyMaterials || !deadline) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: studyMaterials and deadline are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate days until deadline
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 1) {
      return new Response(
        JSON.stringify({ error: 'Deadline must be in the future' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate study plan using NanoGPT
    const studyPlan = await generateStudyPlanWithAI(
      studyMaterials,
      daysUntilDeadline,
      dailyHours || 3,
      env.NANOGPT_API_KEY
    );
    
    // Return the generated plan
    return new Response(
      JSON.stringify({
        success: true,
        totalDays: daysUntilDeadline,
        totalHours: daysUntilDeadline * (dailyHours || 3),
        deadline: deadline,
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
async function generateStudyPlanWithAI(studyMaterials, daysUntilDeadline, dailyHours, apiKey) {
  // Create the prompt for the AI
  const prompt = createStudyPlanPrompt(studyMaterials, daysUntilDeadline, dailyHours);
  
  // Define the JSON schema for structured output
  const jsonSchema = {
    name: "study_plan",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "A comprehensive summary of the study materials and approach"
        },
        schedule: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: {
                type: "string",
                description: "Day identifier (e.g., 'Day 1', 'Day 2')"
              },
              date: {
                type: "string",
                description: "ISO date string for this day"
              },
              topics: {
                type: "array",
                items: { type: "string" },
                description: "List of topics to cover on this day"
              },
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    duration: { type: "number" }
                  },
                  required: ["description", "duration"]
                },
                description: "List of specific tasks with durations in minutes"
              }
            },
            required: ["day", "date", "topics", "tasks"]
          }
        }
      },
      required: ["summary", "schedule"]
    }
  };
  
  // Call NanoGPT API
  const response = await fetch('https://nano-gpt.com/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2.5',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational planner and study coach. Your task is to analyze study materials and create detailed, actionable day-by-day study plans. Be specific, practical, and motivating.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: jsonSchema
      },
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
  
  const studyPlan = JSON.parse(content);
  
  return studyPlan;
}

/**
 * Create the prompt for study plan generation
 */
function createStudyPlanPrompt(studyMaterials, daysUntilDeadline, dailyHours) {
  const totalMinutes = dailyHours * 60;
  const today = new Date();
  const dates = [];
  
  for (let i = 0; i < daysUntilDeadline; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return `Please analyze the following study materials and create a detailed day-by-day study plan.

## STUDY MATERIALS:
${studyMaterials}

## CONSTRAINTS:
- Total days available: ${daysUntilDeadline} days
- Daily study time: ${dailyHours} hours (${totalMinutes} minutes)
- Total study time available: ${daysUntilDeadline * dailyHours} hours
- Start date: ${dates[0]}
- End date: ${dates[dates.length - 1]}

## DATES TO USE:
${dates.map((d, i) => `Day ${i + 1}: ${d}`).join('\n')}

## REQUIREMENTS:
1. Create a comprehensive summary of the materials (key concepts, difficulty areas, prerequisites)
2. Create a day-by-day schedule covering ALL ${daysUntilDeadline} days
3. For each day, provide:
   - Day identifier (e.g., "Day 1", "Day 2")
   - Date (use the exact dates provided above in ISO format)
   - 3-5 specific topics to cover
   - Detailed tasks with estimated durations in minutes (sum should be ~${totalMinutes} minutes per day)
4. Distribute content evenly across all days
5. Include review days and practice problems
6. Make tasks specific and actionable
7. Balance difficulty throughout the schedule

IMPORTANT: Return ONLY the JSON object without markdown formatting, code blocks, or additional text.`;
}
