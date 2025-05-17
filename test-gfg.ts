import { fetchGFGProfile } from './lib/fetchers/gfg.ts';

async function testGFGFetcher() {
  try {
    const username = 'sachinjeevan'; // You can replace with your actual username
    console.log(`Testing GFG fetcher for user: ${username}`);
    
    const result = await fetchGFGProfile(username);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Specifically log the heatmap data
    if (result.activityHeatmap) {
      console.log(`Found ${result.activityHeatmap.length} heatmap entries`);
      console.log('First few entries:', JSON.stringify(result.activityHeatmap.slice(0, 5), null, 2));
    } else {
      console.log('No heatmap data found');
    }
  } catch (error) {
    console.error('Error testing GFG fetcher:', error);
  }
}

testGFGFetcher(); 