const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuestionIds() {
  try {
    // Using actual question IDs from our query
    const questionIds = [
      'cm9yfpzow00078z6atzatw75o',
      'cm9yfq0d1000f8z6awiprxnzz',
      'cm9yfq0qe000n8z6a74dl40se'
    ];

    // Using an actual section ID from our query
    const sectionId = 'section-1745684810640';

    
    // Check if these questions exist in the database
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds
        }
      },
      select: {
        id: true,
        name: true
      }
    });
    
    
    // Check if any SectionQuestion relationships already exist for these questions
    const existingRelations = await prisma.sectionQuestion.findMany({
      where: {
        questionId: {
          in: questionIds
        }
      },
      select: {
        id: true,
        sectionId: true,
        questionId: true
      }
    });
    
    
    // Get the section we'll use for testing
    const testSection = await prisma.section.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        title: true
      }
    });
    
    if (testSection) {
      
      // Try to create a relationship directly
      try {
        // Create relationship for the first question
        const newRelationship = await prisma.sectionQuestion.create({
          data: {
            sectionId: testSection.id,
            questionId: questionIds[0],
            order: 0
          }
        });
        
       
        // Clean up by deleting the test relationship
        await prisma.sectionQuestion.delete({
          where: {
            id: newRelationship.id
          }
        });
       
      } catch (error) {
        console.error('Error creating test relationship:', error);
        
        // If there's a unique constraint error, try to check if the relationship exists
        if (error.code === 'P2002') {
          
          const existingRelation = await prisma.sectionQuestion.findFirst({
            where: {
              sectionId: testSection.id,
              questionId: questionIds[0]
            }
          });
          
          
        }
      }
    } 
  } catch (e) {
    console.error('Error testing question IDs:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testQuestionIds(); 