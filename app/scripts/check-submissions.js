// This script checks for submissions in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubmissions() {
  try {
    // Count total submissions
    const totalCount = await prisma.problemSubmission.count();
    console.log(`Total submissions in database: ${totalCount}`);

    // Get some example submissions
    if (totalCount > 0) {
      const submissions = await prisma.problemSubmission.findMany({
        take: 5,
        orderBy: {
          submittedAt: 'desc'
        }
      });

      console.log('\nLatest 5 submissions:');
      submissions.forEach((sub, i) => {
        console.log(`\nSubmission ${i + 1}:`);
        console.log(`  ID: ${sub.id}`);
        console.log(`  Problem ID: ${sub.problemId}`);
        console.log(`  User ID: ${sub.userId}`);
        console.log(`  Submitted: ${sub.submittedAt}`);
        console.log(`  Status: ${sub.allPassed ? 'ACCEPTED' : 'FAILED'}`);
      });
    }

    // Check if we have any test submissions for a specific problem
    // You can modify these IDs to match your actual data
    const problemId = process.argv[2]; // Pass problem ID as command line argument
    if (problemId) {
      const problemSubmissions = await prisma.problemSubmission.findMany({
        where: {
          problemId
        },
        take: 5
      });

      console.log(`\nFound ${problemSubmissions.length} submissions for problem ID ${problemId}`);
      if (problemSubmissions.length > 0) {
        console.log('\nSubmissions for this problem:');
        problemSubmissions.forEach((sub, i) => {
          console.log(`\nSubmission ${i + 1}:`);
          console.log(`  ID: ${sub.id}`);
          console.log(`  User ID: ${sub.userId}`);
          console.log(`  Submitted: ${sub.submittedAt}`);
          console.log(`  Status: ${sub.allPassed ? 'ACCEPTED' : 'FAILED'}`);
        });
      }
    } else {
      console.log('\nTip: You can check submissions for a specific problem by passing the problem ID as an argument:');
      console.log('node scripts/check-submissions.js YOUR_PROBLEM_ID');
    }
  } catch (error) {
    console.error('Error checking submissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubmissions(); 