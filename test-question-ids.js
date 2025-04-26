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

    console.log('Testing question IDs:', questionIds);
    
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
    
    console.log(`Found ${questions.length} out of ${questionIds.length} questions:`);
    console.log(questions);
    
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
    
    console.log(`Found ${existingRelations.length} existing section-question relationships:`);
    console.log(existingRelations);
    
    // Get the section we'll use for testing
    const testSection = await prisma.section.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        title: true
      }
    });
    
    if (testSection) {
      console.log(`Testing with section: ${testSection.id} (${testSection.title})`);
      
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
        
        console.log('Successfully created relationship:', newRelationship);
        
        // Clean up by deleting the test relationship
        await prisma.sectionQuestion.delete({
          where: {
            id: newRelationship.id
          }
        });
        console.log('Cleaned up test relationship');
      } catch (error) {
        console.error('Error creating test relationship:', error);
        
        // If there's a unique constraint error, try to check if the relationship exists
        if (error.code === 'P2002') {
          console.log('Checking for existing constraint violation...');
          const existingRelation = await prisma.sectionQuestion.findFirst({
            where: {
              sectionId: testSection.id,
              questionId: questionIds[0]
            }
          });
          
          if (existingRelation) {
            console.log('Relationship already exists:', existingRelation);
          }
        }
      }
    } else {
      console.log('Section not found:', sectionId);
    }
  } catch (e) {
    console.error('Error testing question IDs:', e);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

testQuestionIds(); 