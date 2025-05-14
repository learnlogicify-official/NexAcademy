import { PlatformProfile } from './types';

// This function is no longer directly using Puppeteer
// It's now just a placeholder that redirects to our API endpoint
export async function fetchCodingNinjasProfile(profileId: string): Promise<PlatformProfile> {
  return {
    platform: 'codingninjas',
    username: profileId,
    error: 'This function is now handled by a separate API endpoint. Please use the API instead.'
  };
}

// Allow running this file directly with ts-node for HTML dump
if (require.main === module) {
  const profileId = process.argv[2];
  if (!profileId) {
    console.error('Usage: ts-node codingninjas.ts <profileId>');
    process.exit(1);
  }
  fetchCodingNinjasProfile(profileId)
    .then(result => {
      console.log(result);
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} 