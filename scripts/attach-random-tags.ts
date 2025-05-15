import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function attachRandomTagsToTaglessCodingQuestions() {
  // Fetch all tags
  const tags = await prisma.tag.findMany();
  if (tags.length === 0) {
    console.log('No tags found in the database.');
    return;
  }

  // Fetch all coding questions with no tags
  const taglessQuestions = await prisma.codingQuestion.findMany({
    where: {
      tags: { none: {} }
    },
    select: { id: true }
  });

  if (taglessQuestions.length === 0) {
    console.log('No tagless coding questions found.');
    return;
  }

  for (const question of taglessQuestions) {
    // Pick 2-4 random tags
    const numTags = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    const shuffled = [...tags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffled.slice(0, numTags);

    await prisma.codingQuestion.update({
      where: { id: question.id },
      data: {
        tags: {
          connect: selectedTags.map(tag => ({ id: tag.id }))
        }
      }
    });

    console.log(
      `Attached ${selectedTags.length} tags to codingQuestion ${question.id}: [${selectedTags
        .map(t => t.name)
        .join(', ')}]`
    );
  }

  console.log('Done attaching random tags to tagless coding questions.');
}

attachRandomTagsToTaglessCodingQuestions()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  }); 