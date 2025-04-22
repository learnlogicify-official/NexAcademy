import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    // Test folder creation
    const folder = await prisma.folder.create({
      data: {
        name: 'Test Folder',
      },
    });
  

    // Test question creation
    const question = await prisma.question.create({
      data: {
        type: 'MULTIPLE_CHOICE',
        question: 'Test Question',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 'Option 1',
        folderId: folder.id,
      },
    });
  

    // Test fetching questions
    const questions = await prisma.question.findMany({
      include: {
        folder: true,
      },
    });
  

  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 