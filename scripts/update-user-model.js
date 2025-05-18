// This script updates the User model in the database to add the interests field
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserModel() {
  try {
    console.log('Starting database update for User model...');
    
    // Use executeRaw to add the interests column to the User table
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];
    `;
    
    console.log('Successfully added interests field to User model!');
    
    // Update the onboarding/complete route to include interests in user updates
    console.log('Remember to update the onboarding/complete API route to include interests in the user updates.');
    
  } catch (error) {
    console.error('Error updating User model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserModel()
  .then(() => console.log('Update completed.'))
  .catch(error => console.error('Script failed:', error)); 