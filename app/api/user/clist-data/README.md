# Clist API Integration for Coding Portfolios

This API integration connects NexAcademy's coding portfolio feature with the Clist API to fetch real user data from competitive programming platforms.

## Overview

The integration fetches data from platforms like LeetCode, CodeForces, CodeChef, HackerRank, HackerEarth, and GeeksForGeeks.

## API Configuration

To use the Clist API:

1. Get an API key from [Clist.by](https://clist.by/)
2. Create an account on Clist.by to get a username
3. Add these environment variables to your `.env` file:
   ```
   CLIST_API_KEY=your_key_here
   CLIST_USERNAME=your_username_here
   ```

## Endpoints and Parameters

The API uses the following format (v1):
```
https://clist.by/api/v1/[endpoint]/?[parameters]
```

## Authentication Methods

The Clist API supports two authentication methods:

### 1. Query Parameter (Recommended)
```
/?username=YOUR_USERNAME&api_key=YOUR_API_KEY&user=platform_handle&resource_id=102
```

### 2. Authorization Header
```
Authorization: ApiKey YOUR_USERNAME:YOUR_API_KEY
```

Our implementation supports both methods and will automatically try them in sequence.

## Required Parameters

- `username`: Your Clist account username
- `api_key`: Your API key from Clist
- `user`: The user's handle on the platform (e.g., LeetCode username)
- `resource_id`: Numeric ID of the platform (not the domain name)

## Common Endpoints

- `/account/`: User profile information
- `/submission/`: User's submissions
- `/contest_participation/`: User's contest history

## Resource IDs

Each platform has a specific numeric ID in Clist:

| Platform | Resource ID |
|----------|-------------|
| LeetCode | 102 |
| Codeforces | 1 |
| CodeChef | 2 |
| HackerRank | 63 |
| HackerEarth | 73 |
| GeeksForGeeks | 94 |

## Fallback System

The implementation includes a fallback to mock data when:
- No API key is provided
- API calls fail
- Rate limits are hit (Clist allows only 6 API calls per minute)

This ensures the feature works in all scenarios while providing real data when possible.

## Changelog

### v1.0.0 (Initial Implementation)
- Used mock data for demonstration

### v1.1.0 (API Integration)
- Added Clist API integration
- Implemented platform resource mapping
- Added error handling with fallback to mock data

### v1.2.0 (Bugfixes)
- Fixed API endpoint format (/json/ path)
- Changed parameter name from key to api_key
- Fixed endpoint naming (contest_participation)
- Improved error handling with detailed logging

### v1.3.0 (Authentication)
- Added support for both query parameter and authorization header authentication
- Created debugging tools to test different API formats
- Updated documentation with authentication methods

### v1.4.0 (API Version Update)
- Updated to use correct v1 API format
- Added proper parameter structure (username, api_key, user, resource_id)
- Added environment variable for Clist username
- Enhanced error handling and documentation 