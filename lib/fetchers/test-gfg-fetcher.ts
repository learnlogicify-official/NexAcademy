// Simple test script for GFG fetcher
import { fetchGFGProfile } from './gfg';

async function testGFGFetcher() {
  try {
    console.log('Testing GFG profile fetcher...');
    
    // Using the sample username from the link
    const username = 'sachinjeevan';
    console.log(`Fetching profile for: ${username}`);
    
    const profile = await fetchGFGProfile(username);
    
    console.log('--- GFG Profile Response ---');
    console.log(JSON.stringify(profile, null, 2));
    console.log('---------------------------');
    
    return profile;
  } catch (error) {
    console.error('Error testing GFG fetcher:', error);
  }
}

// Run the test
testGFGFetcher(); 