// This script creates a test submission in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestSubmission() {
  try {
    // Get command line arguments
    const problemId = process.argv[2];
    const userId = process.argv[3];
    
    if (!problemId || !userId) {
      console.error('Please provide problemId and userId as arguments:');
      console.error('node scripts/create-test-submission.js PROBLEM_ID USER_ID');
      return;
    }
    
    // Create a new submission
    const submission = await prisma.problemSubmission.create({
      data: {
        problemId,
        userId,
        language: "71", // Python 3
        code: "def solution(nums):\n    return sum(nums)",
        submittedAt: new Date(),
        testcasesPassed: 5,
        totalTestcases: 5,
        allPassed: true,
        runtime: "12ms",
        memory: "13.5MB"
      }
    });
    
    console.log('Created test submission:');
    console.log(`  ID: ${submission.id}`);
    console.log(`  Problem ID: ${submission.problemId}`);
    console.log(`  User ID: ${submission.userId}`);
    console.log(`  Submitted: ${submission.submittedAt}`);
    console.log(`  Status: ${submission.allPassed ? 'ACCEPTED' : 'FAILED'}`);
    
    // Also create a failed submission
    const failedSubmission = await prisma.problemSubmission.create({
      data: {
        problemId,
        userId,
        language: "71", // Python 3
        code: "def solution(nums):\n    # This solution has an error\n    return sum(nums[1:])",
        submittedAt: new Date(Date.now() - 10000), // 10 seconds earlier
        testcasesPassed: 3,
        totalTestcases: 5,
        allPassed: false,
        runtime: "10ms",
        memory: "13.2MB"
      }
    });
    
    console.log('\nCreated failed test submission:');
    console.log(`  ID: ${failedSubmission.id}`);
    console.log(`  Problem ID: ${failedSubmission.problemId}`);
    console.log(`  User ID: ${failedSubmission.userId}`);
    console.log(`  Submitted: ${failedSubmission.submittedAt}`);
    console.log(`  Status: ${failedSubmission.allPassed ? 'ACCEPTED' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error creating test submission:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSubmission(); 