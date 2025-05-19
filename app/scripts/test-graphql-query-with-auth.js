// This script tests the GraphQL API with authentication
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGraphQLQueryWithAuth() {
  try {
    // Get input arguments or use defaults
    const problemId = process.argv[2] || 'cmadvjbo5027r8zupmi57lz8x';
    const userId = process.argv[3] || 'cma1ewcgj00008zw70fyhea3q';
    
    console.log(`Testing GraphQL query with problemId: ${problemId}, userId: ${userId}`);
    
    // 1. Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      console.error(`User with ID ${userId} not found!`);
      return;
    }
    
    console.log(`Found user: ${user.name || user.email}`);
    
    // 2. Check problem exists
    const problem = await prisma.problemSubmission.findFirst({
      where: { problemId },
      select: { problemId: true, id: true }
    });
    
    if (!problem) {
      console.error(`No submissions found for problem ID ${problemId}`);
    } else {
      console.log(`Found submissions for problem ID ${problemId}`);
    }
    
    // 3. Check specific user's submissions for a problem
    const submissions = await prisma.problemSubmission.findMany({
      where: {
        problemId,
        userId
      },
      take: 5,
      orderBy: {
        submittedAt: 'desc'
      }
    });
    
    console.log(`\nDirect database query: Found ${submissions.length} submissions for this user and problem`);
    
    if (submissions.length > 0) {
      console.log('\nFirst submission from database:');
      console.log(`  ID: ${submissions[0].id}`);
      console.log(`  Problem ID: ${submissions[0].problemId}`);
      console.log(`  User ID: ${submissions[0].userId}`);
      console.log(`  Submitted: ${submissions[0].submittedAt}`);
      console.log(`  Status: ${submissions[0].allPassed ? 'ACCEPTED' : 'FAILED'}`);
    }
    
    // 4. Direct GraphQL query would require auth which we can't do in a Node script
    console.log('\nFor API testing, use the browser console while logged in:');
    console.log(`
// Copy this to browser console while logged in to test the GraphQL API
fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: \`
      query GetProblemSubmissions($problemId: ID!, $userId: ID, $page: Int, $pageSize: Int) {
        problemSubmissions(
          problemId: "${problemId}"
          userId: "${userId}"
          page: 1
          pageSize: 10
        ) {
          submissions {
            id
            userId
            problemId
            language
            submittedAt
            testcasesPassed
            totalTestcases
            allPassed
            runtime
            memory
            status
          }
          total
          page
          pageSize
          totalPages
        }
      }
    \`
  })
})
.then(res => res.json())
.then(data => console.log('GraphQL Response:', data));
`);
    
    // 5. Test creating a submission directly in the database
    console.log('\nCreating a test submission for debugging purposes...');
    
    const newSubmission = await prisma.problemSubmission.create({
      data: {
        problemId,
        userId,
        language: "71", // Python 3
        code: "def solution(nums):\n    # Test debugging submission\n    return sum(nums)",
        submittedAt: new Date(),
        testcasesPassed: 5,
        totalTestcases: 5,
        allPassed: true,
        runtime: "15ms",
        memory: "14.2MB"
      }
    });
    
    console.log('Created debug test submission:');
    console.log(`  ID: ${newSubmission.id}`);
    console.log(`  Problem ID: ${newSubmission.problemId}`);
    console.log(`  User ID: ${newSubmission.userId}`);
    console.log(`  Submitted: ${newSubmission.submittedAt}`);
    console.log(`  Status: ${newSubmission.allPassed ? 'ACCEPTED' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error testing GraphQL query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGraphQLQueryWithAuth(); 