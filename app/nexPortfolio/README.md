# Coding Portfolio Feature

The Coding Portfolio feature allows students to connect their coding profiles from various competitive programming platforms and showcase their achievements in a unified dashboard.

## Supported Platforms

- LeetCode
- CodeForces
- CodeChef
- HackerRank
- HackerEarth
- GeeksforGeeks

## Setup

### Environment Variables

To enable real API integration with Clist, you need to obtain an API key and add it to your environment variables:

1. Visit [Clist API Documentation](https://clist.by/api/v2/doc/) and sign up for an account
2. Get your API key
3. Add the following to your `.env` file:

```
CLIST_API_KEY="your_clist_api_key"
```

If no API key is provided, the system will use mock data for demonstration purposes.

### File Structure

- `app/coding-portfolio/page.tsx` - Main page component
- `app/api/user/platform-handles/route.ts` - API for managing platform username connections
- `app/api/user/clist-data/route.ts` - API for fetching statistics from Clist
- `components/coding-portfolio/form.tsx` - UI component for managing connections
- `components/coding-portfolio/platform-card.tsx` - UI component for displaying statistics

## Feature Details

### User Flow

1. Users connect their usernames for various coding platforms
2. The system retrieves statistics from Clist API (or uses mock data if API key not available)
3. Achievements are displayed in a user-friendly dashboard

### Data Model

The feature uses the `UserPlatformHandle` Prisma model to store connections:

```
model UserPlatformHandle {
  id        String   @id
  userId    String
  platform  String
  handle    String
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime
  User      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, platform])
  @@index([platform])
  @@index([userId])
}
```

### API Endpoints

- `GET /api/user/platform-handles` - Retrieve user's connected platforms
- `POST /api/user/platform-handles` - Add or update a platform connection
- `DELETE /api/user/platform-handles?platform={platform}` - Remove a platform connection
- `GET /api/user/clist-data` - Fetch statistics for connected platforms

## Development

To extend this feature:

1. Add support for more platforms in the `platformMapping` object in `clist-data/route.ts`
2. Enhance the UI components to display additional statistics
3. Improve data visualization with charts or progress indicators 