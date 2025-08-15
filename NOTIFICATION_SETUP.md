# Notification System Setup Guide

## Overview
The notification system provides real-time notifications for social interactions including follows, likes, and comments. The system uses a combination of Django signals for backend notification creation and polling for frontend updates.

## Current Implementation

### Backend (Django)
- **Signals**: Automatically create notifications when users follow, like, or comment
- **API Endpoints**: Provide notification management (list, mark as read, counts)
- **Supabase Integration**: Prepared for real-time events (currently logging only)

### Frontend (React)
- **NotificationContext**: Global state management for notification counts
- **Polling**: Refreshes notification counts every 30 seconds
- **Manual Refresh**: Updates counts after follow actions
- **Real-time Subscription**: Prepared for Supabase real-time (currently using polling)

## Setup Instructions

### 1. Backend Environment Variables
Add these to your Django `.env` file:
```bash
# Supabase Configuration (for real-time notifications)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (if using Supabase)
DATABASE_URL=your_supabase_database_url
```

### 2. Frontend Environment Variables
Create a `.env` file in the frontend directory:
```bash
# Supabase Configuration (for real-time notifications)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
VITE_API_URL=http://localhost:8000/api
```

### 3. Supabase Setup (Optional for Real-time)
1. Create a Supabase project
2. Enable real-time for the `notifications` table
3. Set up row level security (RLS) policies
4. Update the backend `utils.py` to use actual Supabase real-time

## How It Works

### Notification Creation
1. User A follows User B
2. Django signal `create_follow_notification` triggers
3. Notification is created in the database
4. Event is logged (or published to Supabase in real-time setup)

### Frontend Updates
1. **Initial Load**: Notification counts are loaded when user logs in
2. **Polling**: Counts refresh every 30 seconds
3. **Manual Refresh**: Counts update after follow actions
4. **Real-time**: When Supabase is configured, instant updates via WebSocket

### Notification Types
- **Follow**: When someone follows a user
- **Like**: When someone likes a post
- **Comment**: When someone comments on a post

## Testing the System

### 1. Create Test Users
```bash
# Use the Django admin or API to create test users
```

### 2. Test Follow Notifications
1. Login as User A
2. Follow User B
3. Login as User B
4. Check notification count and dropdown

### 3. Test Real-time (when Supabase is configured)
1. Open two browser windows
2. Login as different users
3. Follow one user from the other
4. Watch notification count update in real-time

## Troubleshooting

### Notification Count Not Updating
1. Check browser console for errors
2. Verify API endpoints are working
3. Check if polling is enabled (30-second intervals)
4. Ensure NotificationContext is properly wrapped

### Real-time Not Working
1. Verify Supabase environment variables
2. Check Supabase project settings
3. Ensure real-time is enabled for notifications table
4. Check browser console for WebSocket errors

### Backend Issues
1. Check Django logs for signal errors
2. Verify database migrations are applied
3. Check notification model and signals are properly configured

## Performance Considerations

### Current Implementation
- **Polling**: 30-second intervals (good balance of responsiveness vs performance)
- **Manual Refresh**: After user actions
- **Caching**: Notification counts cached in context

### Optimization Options
- **Real-time**: WebSocket updates for instant notifications
- **Push Notifications**: Browser notifications for offline users
- **Batch Updates**: Group multiple notifications
- **Pagination**: Load notifications in chunks

## Future Enhancements

1. **Real-time Implementation**: Enable Supabase WebSocket connections
2. **Push Notifications**: Browser notifications for offline users
3. **Email Notifications**: Send email for important notifications
4. **Notification Preferences**: Allow users to customize notification types
5. **Notification History**: Archive old notifications
6. **Mobile Notifications**: Push notifications for mobile apps
