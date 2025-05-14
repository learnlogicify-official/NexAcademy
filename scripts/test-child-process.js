const { exec } = require('child_process');
const fs = require('fs');

const username = process.argv[2] || 'sachin_official';
const scriptPath = require('path').join(__dirname, 'fetch-hackerearth.js');

exec(`node "${scriptPath}" "${username}" --debug`, (error, stdout, stderr) => {
  if (error) {
    console.error('Exec error:', error);
  }
  if (stderr) {
    console.error('Script stderr:', stderr);
  }
  console.log('Script stdout:', stdout);
  fs.writeFileSync('child_process_output.json', stdout, 'utf-8');
  console.log('Output written to child_process_output.json');
}); 