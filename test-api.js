/**
 * Test script for NanoGPT API integration
 * Tests the study plan generation functionality
 */

const NANOGPT_API_KEY = 'sk-nano-19b7be94-162e-4290-a893-4dc90c7c73c9';

async function testNanoGPTAPI() {
  console.log('🧪 Testing NanoGPT API integration...\n');
  
  const testMaterials = `
Chapter 1: Introduction to Machine Learning
- Definition of machine learning
- Types of learning: supervised, unsupervised, reinforcement
- Basic terminology: features, labels, training data

Chapter 2: Linear Regression
- Simple linear regression
- Multiple linear regression
- Cost function and gradient descent
- Model evaluation metrics

Chapter 3: Classification
- Logistic regression
- Decision trees
- Support Vector Machines
- Evaluation metrics: accuracy, precision, recall
`;
  
  const daysUntilDeadline = 7;
  const dailyHours = 2;
  
  console.log('📚 Test Study Materials:', testMaterials.substring(0, 200) + '...');
  console.log(`📅 Days until deadline: ${daysUntilDeadline}`);
  console.log(`⏰ Daily hours: ${dailyHours}\n`);
  
  const prompt = `Please analyze the following study materials and create a detailed day-by-day study plan.

## STUDY MATERIALS:
${testMaterials}

## CONSTRAINTS:
- Total days available: ${daysUntilDeadline} days
- Daily study time: ${dailyHours} hours (${dailyHours * 60} minutes)
- Total study time available: ${daysUntilDeadline * dailyHours} hours

## REQUIREMENTS:
1. Create a comprehensive summary of the materials (key concepts, difficulty areas, prerequisites)
2. Create a day-by-day schedule covering ALL days from today until the deadline
3. For each day, provide:
   - Day identifier (e.g., "Day 1", "Day 2")
   - Date (ISO format)
   - 3-5 specific topics to cover
   - Detailed tasks with estimated durations in minutes
4. Distribute content evenly across all days
5. Include review days and practice problems
6. Make tasks specific and actionable
7. Balance difficulty throughout the schedule

Return your response as valid JSON with this structure:
{
  "summary": "comprehensive summary text",
  "schedule": [
    {
      "day": "Day 1",
      "date": "2024-01-15",
      "topics": ["topic1", "topic2"],
      "tasks": [{"description": "task", "duration": 30}]
    }
  ]
}`;
  
  try {
    console.log('🚀 Sending request to NanoGPT API...');
    
    const response = await fetch('https://nano-gpt.com/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NANOGPT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2.5',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational planner and study coach. Your task is to analyze study materials and create detailed, actionable day-by-day study plans. Be specific, practical, and motivating. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response received!');
    console.log('📊 Model used:', data.model);
    console.log('📝 Response content preview:\n');
    
    const content = data.choices[0].message.content;
    
    // Try to parse as JSON
    try {
      // Extract JSON from markdown code blocks if present
      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      // Try to find JSON object if still wrapped
      const objectMatch = jsonContent.match(/(\{[\s\S]*\})/);
      if (objectMatch) {
        jsonContent = objectMatch[1];
      }
      
      const studyPlan = JSON.parse(jsonContent);
      console.log('✅ JSON parsing successful!');
      console.log('\n📝 Summary:', studyPlan.summary.substring(0, 200) + '...');
      console.log(`\n📅 Schedule has ${studyPlan.schedule.length} days`);
      console.log('\n📋 Day 1 preview:');
      console.log('  Day:', studyPlan.schedule[0].day);
      console.log('  Date:', studyPlan.schedule[0].date);
      console.log('  Topics:', studyPlan.schedule[0].topics.join(', '));
      console.log('  Tasks count:', studyPlan.schedule[0].tasks.length);
      
      return {
        success: true,
        data: studyPlan
      };
    } catch (parseError) {
      console.log('⚠️ Response is not valid JSON:');
      console.log(content.substring(0, 500));
      return {
        success: false,
        error: 'JSON parse error',
        content: content
      };
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testNanoGPTAPI().then(result => {
  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('✅ TEST PASSED: NanoGPT API integration works!');
  } else {
    console.log('❌ TEST FAILED:', result.error);
  }
  console.log('='.repeat(50));
});
