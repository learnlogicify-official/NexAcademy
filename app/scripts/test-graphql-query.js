// This script tests the GraphQL API with a direct query
const fetch = require('node-fetch');

async function testGraphQLQuery() {
  try {
    // You can modify these values to match your data
    const problemId = process.argv[2] || 'cmadvjbo5027r8zupmi57lz8x';
    const userId = process.argv[3] || 'cma1ewcgj00008zw70fyhea3q';
    
    console.log(`Testing GraphQL query with problemId: ${problemId}, userId: ${userId}`);
    
    // GraphQL query
    const query = `
      query GetProblemSubmissions($problemId: ID!, $userId: ID, $page: Int, $pageSize: Int) {
        problemSubmissions(
          problemId: $problemId
          userId: $userId
          page: $page
          pageSize: $pageSize
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
    `;
    
    // GraphQL variables
    const variables = {
      problemId,
      userId,
      page: 1,
      pageSize: 10
    };
    
    // Make the request
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    // Parse the JSON response
    const data = await response.json();
    
    console.log('GraphQL Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if we got submissions
    const submissions = data?.data?.problemSubmissions?.submissions || [];
    console.log(`\nFound ${submissions.length} submissions`);
    
    if (submissions.length > 0) {
      console.log('\nFirst submission:');
      console.log(`  ID: ${submissions[0].id}`);
      console.log(`  Problem ID: ${submissions[0].problemId}`);
      console.log(`  User ID: ${submissions[0].userId}`);
      console.log(`  Submitted: ${submissions[0].submittedAt}`);
      console.log(`  Status: ${submissions[0].status}`);
    }
    
  } catch (error) {
    console.error('Error testing GraphQL query:', error);
  }
}

testGraphQLQuery(); 