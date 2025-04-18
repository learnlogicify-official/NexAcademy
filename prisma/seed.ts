import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create some initial folders
  const folders = await Promise.all([
    prisma.folder.create({
      data: {
        name: 'Mathematics',
        subfolders: {
          create: [
            { name: 'Algebra' },
            { name: 'Geometry' },
            { name: 'Calculus' }
          ]
        }
      }
    }),
    prisma.folder.create({
      data: {
        name: 'Science',
        subfolders: {
          create: [
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Biology' }
          ]
        }
      }
    }),
    prisma.folder.create({
      data: {
        name: 'Programming',
        subfolders: {
          create: [
            { name: 'Python' },
            { name: 'JavaScript' },
            { name: 'Java' }
          ]
        }
      }
    })
  ]);

  console.log('Created folders:', folders);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 