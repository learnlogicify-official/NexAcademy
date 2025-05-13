#!/usr/bin/env node

// This script tests the handling of Time Limit Exceeded cases in Judge0
// Run with: node scripts/test-time-limit-exceeded.js

const { PrismaClient } = require('@prisma/client');
const { runWithJudge0 } = require('../utils/judge0');
const { Judge0StatusCode } = require('../utils/judge0-status');

// Create an infinite loop code that will trigger a Time Limit Exceeded error
const createTimeoutCode = (language) => {
  switch (language) {
    case 63: // JavaScript (Node.js)
      return `
// This will cause a Time Limit Exceeded error
function solution() {
  while(true) {
    // Infinite loop
  }
  return 42;
}

solution();
      `;
    
    case 71: // Python 3
      return `
# This will cause a Time Limit Exceeded error
def solution():
    while True:
        pass  # Infinite loop
    return 42

solution()
      `;
    
    case 54: // C++ (GCC)
      return `
#include <iostream>

int main() {
    // This will cause a Time Limit Exceeded error
    while(true) {
        // Infinite loop
    }
    return 0;
}
      `;
    
    default:
      return `
// This will cause a Time Limit Exceeded error
function solution() {
  while(true) {
    // Infinite loop
  }
  return 42;
}

solution();
      `;
  }
};

async function main() {
  console.log('Testing Time Limit Exceeded handling in Judge0...');

  // Test with JavaScript by default
  const languageId = 63; // JavaScript (Node.js)
  const sourceCode = createTimeoutCode(languageId);
  
  const testCases = [
    {
      input: 'test input',
      expectedOutput: '42'
    }
  ];
  
  // Set low CPU and wall time limits to trigger the timeout faster
  const executionSettings = {
    cpu_time_limit: 1, // 1 second
    wall_time_limit: 2, // 2 seconds
    memory_limit: 128000 // 128MB
  };
  
  console.log('Submitting code that should time out...');
  
  try {
    // Create a progress callback to see real-time updates
    const progressCallback = (results, index) => {
      const result = results[0];
      console.log(`Progress update (${index}/1): status=${result.status?.id || 'unknown'}, verdict=${result.verdict || 'unknown'}`);
    };

    const results = await runWithJudge0({
      sourceCode,
      languageId,
      testCases,
      progressCallback,
      executionSettings
    });
    
    // Log the results
    console.log('\nTest Results:');
    console.log('=============');
    
    results.forEach((result, index) => {
      console.log(`Test Case ${index + 1}:`);
      console.log(`Status ID: ${result.status.id}`);
      console.log(`Status Description: ${result.status.description}`);
      console.log(`Verdict: ${result.verdict}`);
      console.log(`Input: ${result.input}`);
      console.log(`Expected: ${result.expected}`);
      console.log(`Output: ${result.output || '(none)'}`);
      console.log(`Time: ${result.time || 'N/A'}`);
      console.log(`Memory: ${result.memory || 'N/A'}`);
      
      if (result.stderr) {
        console.log(`Error output: ${result.stderr}`);
      }
      
      if (result.compile_output) {
        console.log(`Compile output: ${result.compile_output}`);
      }
      
      console.log('------------');
    });
    
    // Check if we got Time Limit Exceeded as expected
    const hasTLE = results.some(result => result.status.id === 5 || result.verdict === 'Time Limit Exceeded');
    
    if (hasTLE) {
      console.log('✅ Successfully detected Time Limit Exceeded case');
    } else {
      console.log('❌ Did not get the expected Time Limit Exceeded result');
      console.log('This could indicate a problem with how Judge0 signals timeouts or how our code processes them');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  }); 