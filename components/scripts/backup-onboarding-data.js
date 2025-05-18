/**
 * This script saves onboarding data that might not be stored in the database yet
 * due to pending schema migrations. It creates a JSON file with user data to be 
 * migrated later when the schema changes are applied.
 */

const fs = require('fs');
const path = require('path');

/**
 * Backup onboarding data for a user
 * @param {string} userId - User ID
 * @param {object} data - Onboarding data (username, bio, learningPath, etc.)
 */
function backupOnboardingData(userId, data) {
  // Create backup directory if it doesn't exist
  const backupDir = path.join(process.cwd(), 'data', 'onboarding-backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Create or update backup file for this user
  const backupFile = path.join(backupDir, `${userId}.json`);
  const timestamp = new Date().toISOString();
  
  // Load existing backup or create new one
  let backup = {};
  if (fs.existsSync(backupFile)) {
    try {
      backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    } catch (error) {
      console.error(`Error reading backup file for user ${userId}:`, error);
    }
  }

  // Update with new data
  backup.updatedAt = timestamp;
  backup.data = data;

  // Save backup
  try {
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`Backup created for user ${userId} at ${timestamp}`);
    return true;
  } catch (error) {
    console.error(`Error writing backup file for user ${userId}:`, error);
    return false;
  }
}

module.exports = { backupOnboardingData }; 