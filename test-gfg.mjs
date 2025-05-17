// This is a simple test to extract GeeksForGeeks user activity data
import fetch from 'node-fetch';

async function extractGFGActivityData() {
  try {
    const username = 'sachinjeevan'; // Replace with actual username if needed
    console.log(`Extracting GeeksForGeeks activity data for ${username}`);
    
    // Fetch the main profile page
    const url = `https://www.geeksforgeeks.org/user/${username}/`;
    console.log(`Fetching profile: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });
    
    console.log(`Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`HTML length: ${html.length} characters`);
    
    // Extract embedded activity data
    console.log('Searching for submission activity data...');
    
    // Method 1: Look for submissionActivityMap
    let activityData = null;
    const activityMapRegex = /submissionActivityMap\s*=\s*({[^;]+});/;
    const activityMatch = html.match(activityMapRegex);
    
    if (activityMatch && activityMatch[1]) {
      console.log('Found submissionActivityMap data');
      try {
        // Replace single quotes with double quotes for JSON parsing
        const jsonStr = activityMatch[1].replace(/'/g, '"');
        activityData = JSON.parse(jsonStr);
        
        console.log('Activity data:');
        console.log(JSON.stringify(activityData, null, 2));
        
        // Convert to the format used in the app
        const heatmapData = Object.entries(activityData).map(([date, count]) => ({
          date,
          count: typeof count === 'number' ? count : parseInt(count)
        }));
        
        console.log('Formatted heatmap data:');
        console.log(JSON.stringify(heatmapData, null, 2));
        
        console.log(`Total heatmap entries: ${heatmapData.length}`);
        
        // Save a sample of this data to use for updating the fetcher
        return heatmapData;
      } catch (e) {
        console.error('Error parsing activity data:', e);
      }
    } else {
      console.log('No submissionActivityMap data found');
      
      // Method 2: Try alternative patterns
      const alternativePatterns = [
        /userSubmissions\s*=\s*({[^;]+});/,
        /activityData\s*=\s*({[^;]+});/,
        /heatmap_data\s*=\s*({[^;]+});/,
        /window\.activity\s*=\s*({[^;]+});/
      ];
      
      for (const pattern of alternativePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          console.log(`Found data matching pattern: ${pattern}`);
          try {
            const jsonStr = match[1].replace(/'/g, '"');
            const data = JSON.parse(jsonStr);
            console.log('Data preview:', JSON.stringify(data).substring(0, 200));
            break;
          } catch (e) {
            console.log(`Could not parse data for pattern ${pattern}:`, e.message);
          }
        }
      }
      
      // Method 3: Look for any date-like patterns in script tags
      console.log('Searching for script tags with date patterns...');
      const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
      let scriptMatch;
      let scriptCount = 0;
      
      while ((scriptMatch = scriptRegex.exec(html)) !== null) {
        scriptCount++;
        const scriptContent = scriptMatch[1];
        
        // Look for date strings in ISO format (YYYY-MM-DD)
        const datePattern = /["'](\d{4}-\d{2}-\d{2})["']\s*:\s*(\d+)/g;
        let dateMatch;
        let dateCount = 0;
        const dateMap = {};
        
        while ((dateMatch = datePattern.exec(scriptContent)) !== null) {
          dateCount++;
          const date = dateMatch[1];
          const count = parseInt(dateMatch[2]);
          dateMap[date] = count;
        }
        
        if (dateCount > 0) {
          console.log(`Found ${dateCount} date entries in script #${scriptCount}`);
          console.log('Date data preview:', JSON.stringify(dateMap).substring(0, 200));
          
          // Convert to the format used in the app
          const heatmapData = Object.entries(dateMap).map(([date, count]) => ({
            date,
            count
          }));
          
          return heatmapData;
        }
      }
      
      console.log(`Examined ${scriptCount} script tags, no date patterns found`);
    }
  } catch (error) {
    console.error('Error extracting GeeksForGeeks activity data:', error);
  }
  
  return null;
}

// Run the extraction
extractGFGActivityData()
  .then(heatmapData => {
    if (heatmapData) {
      console.log(`Successfully extracted ${heatmapData.length} activity data points`);
    } else {
      console.log('Failed to extract activity data');
    }
  }); 