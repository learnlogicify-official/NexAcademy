# GitHub Integration for NexAcademy

This guide provides instructions on setting up and using the GitHub integration feature in NexAcademy, which allows users to connect their GitHub accounts and display their public repositories on their profile page.

## Features

- OAuth integration with GitHub
- Display public repositories on the user's profile page
- Show repository stats like stars and forks
- Connect GitHub directly from the profile page

## Setup Instructions

### 1. Create GitHub OAuth App

1. Go to your GitHub account settings: https://github.com/settings/developers
2. Click on "New OAuth App"
3. Fill in the following details:
   - **Application name**: NexAcademy
   - **Homepage URL**: Your application's URL (e.g., `http://localhost:3000` for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (for development)
4. Click "Register application"
5. On the next page, you'll see your Client ID
6. Generate a new Client Secret

### 2. Configure Environment Variables

Add the following variables to your `.env.local` file:

```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

For production deployment:
1. Update the callback URL in your GitHub OAuth App settings to your production domain
2. Make sure your production environment has the correct environment variables set

### 3. Database Schema Update

The GitHub integration adds the following fields to the `User` model:

- `githubUsername`: Stores the connected GitHub username
- `githubAccessToken`: Stores the OAuth access token for API calls

## Usage

### Connecting GitHub Account

Users can connect their GitHub account in two ways:

1. **During sign-in**: 
   - Click the GitHub button on the sign-in page
   - Authorize NexAcademy to access your GitHub account

2. **From profile page**:
   - Visit your profile page
   - Find the "Projects" card
   - Click "Connect GitHub" button
   - Authorize NexAcademy to access your GitHub account

### Viewing GitHub Repositories

Once connected, public repositories will automatically appear in the Projects section of the user's profile page. The repositories are sorted by last updated date and display:

- Repository name
- Description
- Primary language (as a tag)
- Last updated date
- Stars count
- Forks count

## Troubleshooting

### Common Issues

1. **Cannot connect GitHub account**:
   - Ensure environment variables are correctly set
   - Check that your OAuth callback URL matches your application URL

2. **Repositories not appearing**:
   - Verify that you have public repositories on GitHub
   - Check browser console for API errors
   - Ensure your GitHub access token has not expired

3. **Access Token Expired**:
   - Simply reconnect your GitHub account by clicking "Connect GitHub" again

## Developer Notes

- The GitHub API has rate limits. If you're developing/testing extensively, you may hit these limits.
- The GitHub integration retrieves the most recent 10 repositories to avoid performance issues with accounts that have many repositories.
- All repository data is fetched fresh each time the profile page is loaded - it is not cached in the database.

## Production Deployment Checklist

When deploying to production, make sure to:

1. Update the OAuth callback URL in your GitHub app settings to your production domain
2. Set the correct environment variables in your production environment
3. Ensure your production database has been migrated with the GitHub fields
4. Consider implementing GitHub API caching if you have many users to avoid rate limits

## Security Considerations

- GitHub access tokens are stored in the database but are never exposed to the client side
- The application only requests the minimum scopes needed (`read:user`, `user:email`, `repo`)
- Users can revoke access at any time from their GitHub settings 