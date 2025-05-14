#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory of this script
const scriptsDir = __dirname;

// Log start message
console.log('Setting up standalone scripts environment...');

try {
  // Check if package.json exists
  const packageJsonPath = path.join(scriptsDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: package.json not found in scripts directory');
    process.exit(1);
  }

  // Install dependencies for the scripts directory
  console.log('Installing dependencies...');
  execSync('npm install', { 
    cwd: scriptsDir, 
    stdio: 'inherit' 
  });

  // Make the fetch script executable
  console.log('Making scripts executable...');
  execSync('chmod +x fetch-codingninjas.js', { 
    cwd: scriptsDir,
    stdio: 'inherit'
  });

  console.log('Setup completed successfully!');
} catch (error) {
  console.error('Error during setup:', error.message);
  process.exit(1);
} 