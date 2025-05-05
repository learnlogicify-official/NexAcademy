import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fetch all tags and all coding questions
  const tags = await prisma.tag.findMany();
  const codingQuestions = await prisma.codingQuestion.findMany();

  if (tags.length === 0) {
    return;
  }

  for (const cq of codingQuestions) {
    // Pick a random number of tags (1 to 3)
    const numTags = Math.floor(Math.random() * 3) + 1;
    // Shuffle and pick random tags
    const shuffled = [...tags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffled.slice(0, numTags);

    await prisma.codingQuestion.update({
      where: { id: cq.id },
      data: {
        tags: {
          set: selectedTags.map(tag => ({ id: tag.id })),
        },
      },
    });
  }
}

main()
  .catch(e => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 