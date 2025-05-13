import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // This is just a test endpoint
  return NextResponse.json({
    success: true,
    message: 'If you see this, the API works, but you need to click a button in the UI to test notifications',
  });
}

export async function POST(request: Request) {
  try {
    // Let's simulate various XP data responses
    const { type = 'default' } = await request.json();
    
    let responseData;
    
    // Different test scenarios
    switch (type) {
      case 'correct_submission':
        responseData = {
          success: true,
          xp: {
            awarded: true,
            amount: 10,
            newTotal: 150,
            levelUp: false,
            newLevel: null
          }
        };
        break;
      
      case 'level_up':
        responseData = {
          success: true,
          xp: {
            awarded: true,
            amount: 15,
            newTotal: 200,
            levelUp: true,
            newLevel: 3
          }
        };
        break;
        
      case 'assessment':
        responseData = {
          success: true,
          xp: {
            awarded: true,
            amount: 25,
            newTotal: 175,
            levelUp: false,
            newLevel: null,
            eventType: 'assessment_completion'
          }
        };
        break;
        
      default:
        responseData = {
          success: true,
          message: 'No XP data in response'
        };
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process test notification' }, 
      { status: 500 }
    );
  }
} 