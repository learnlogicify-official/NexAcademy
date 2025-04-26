const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getQuestions() {
  try {
    const questions = await prisma.question.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        type: true
      }
    });
    
    console.log('Available questions:');
    console.log(questions);
    
    // Also get available sections
    const sections = await prisma.section.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        assessmentId: true
      }
    });
    
    console.log('\nAvailable sections:');
    console.log(sections);
    
  } catch (e) {
    console.error('Error fetching questions:', e);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

getQuestions(); 