# Notifications & Admin Dashboard Features

This document describes the notifications and admin dashboard features that have been implemented in the SocialConnect frontend.

## 🎯 Features Implemented

### 1. Live Notifications System
- **Real-time notifications** using Supabase Realtime
- **Notification dropdown** in the navigation bar
- **Full notifications page** with filtering and pagination
- **Automatic notification creation** for follows, likes, and comments
- **Mark as read** functionality (individual and bulk)

### 2. Admin Dashboard
- **Platform statistics** with real-time metrics
- **User management** with search, filtering, and bulk actions
- **Post management** with content moderation capabilities
- **Role-based access control** (admin-only features)

## 📁 File Structure

```
src/
├── types/
│   ├── notifications.ts     # Notification type definitions
│   └── admin.ts            # Admin type definitions
├── api/
│   ├── notificationsApi.ts # Notification API calls
│   └── adminApi.ts         # Admin API calls
├── utils/
│   └── supabase.ts         # Supabase real-time client
├── components/
│   ├── notifications/
│   │   ├── NotificationItem.tsx      # Individual notification component
│   │   └── NotificationDropdown.tsx  # Dropdown notification menu
│   ├── admin/
│   │   ├── AdminStats.tsx           # Platform statistics component
│   │   ├── UserManagement.tsx       # User management interface
│   │   └── PostManagement.tsx       # Post management interface
│   └── layout/
│       ├── Navigation.tsx           # Main navigation with notifications
│       └── Layout.tsx               # Layout wrapper component
└── pages/
    ├── AdminDashboard.tsx           # Main admin dashboard page
    └── Notifications.tsx            # Full notifications page
```

## 🚀 Setup Instructions

### 1. Environment Variables
Create a `.env` file in the frontend root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Supabase Configuration (for real-time notifications)
# Get these values from your Supabase project dashboard
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important**: If you don't have Supabase set up yet, the notifications will still work for fetching existing notifications, but real-time updates won't function. The app will show a warning in the console but continue to work normally.

### 2. Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from the project settings
3. Add them to your `.env` file
4. Enable real-time for the `notifications` table in Supabase

### 3. Backend Requirements
Ensure your Django backend has the following endpoints:
- `/api/notifications/` - GET, POST
- `/api/notifications/{id}/read/` - POST
- `/api/notifications/mark-all-read/` - POST
- `/api/notifications/count/` - GET
- `/api/admin/users/` - GET, PUT
- `/api/admin/posts/` - GET, DELETE
- `/api/admin/stats/` - GET

## 🎨 Features Overview

### Notifications System

#### Real-time Notifications
- Automatically receives new notifications via Supabase Realtime
- Shows notification count badge in navigation
- Updates in real-time without page refresh

#### Notification Types
- **Follow notifications**: When someone follows a user
- **Like notifications**: When someone likes a post
- **Comment notifications**: When someone comments on a post

#### Notification Management
- Click to mark individual notifications as read
- "Mark all as read" functionality
- Filter between all and unread notifications
- Pagination for large notification lists

### Admin Dashboard

#### Overview Tab
- Total users, posts, likes, and comments
- Active users and posts today
- Users and posts created today
- Visual statistics cards with icons

#### Users Tab
- List all users with pagination
- Search users by username, email, name
- Filter by role (user/admin) and status (active/inactive)
- View detailed user information
- Activate/deactivate users
- Promote/demote admin privileges

#### Posts Tab
- List all posts with pagination
- Search posts by content or author
- Filter by category and status
- View detailed post information
- Delete posts (soft delete)

#### Security Features
- Role-based access control
- Only users with `role='admin'` can access admin features
- Automatic redirect for non-admin users
- Secure API calls with JWT authentication

## 🔧 Usage

### For Regular Users
1. **Notifications**: Click the bell icon in the navigation to see notifications
2. **Full Notifications Page**: Navigate to `/notifications` for a complete view
3. **Real-time Updates**: Notifications appear automatically when received

### For Admin Users
1. **Admin Dashboard**: Click "Admin" in the navigation or go to `/admin`
2. **User Management**: Use the Users tab to manage user accounts
3. **Post Management**: Use the Posts tab to moderate content
4. **Statistics**: View platform metrics in the Overview tab

## 🎯 Key Components

### NotificationDropdown
- Shows notification bell with unread count
- Dropdown with recent notifications
- Real-time updates via Supabase
- Mark as read functionality

### AdminDashboard
- Tabbed interface for different admin functions
- Role-based access control
- Comprehensive user and post management
- Real-time statistics

### UserManagement
- Searchable and filterable user list
- Bulk actions for user management
- Detailed user information modal
- Role and status management

### PostManagement
- Grid view of posts with images
- Search and filter capabilities
- Post deletion with confirmation
- Detailed post information modal

## 🔒 Security Considerations

1. **Authentication**: All admin endpoints require JWT authentication
2. **Authorization**: Only admin users can access admin features
3. **Input Validation**: All user inputs are validated
4. **CSRF Protection**: API calls include proper headers
5. **Error Handling**: Comprehensive error handling and user feedback

## 🚀 Performance Optimizations

1. **Pagination**: All lists use pagination to handle large datasets
2. **Lazy Loading**: Images and content load as needed
3. **Real-time Updates**: Efficient real-time updates via Supabase
4. **Caching**: Notification counts are cached locally
5. **Optimized Queries**: API calls are optimized for performance

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create notifications by following, liking, and commenting
- [ ] Test real-time notification delivery
- [ ] Test notification dropdown functionality
- [ ] Test full notifications page
- [ ] Test admin dashboard access (admin users only)
- [ ] Test user management features
- [ ] Test post management features
- [ ] Test statistics display
- [ ] Test search and filter functionality
- [ ] Test pagination

## 🔧 Troubleshooting

### Common Issues

1. **Supabase URL Error**: If you see "Failed to construct 'URL': Invalid URL" error:
   - Check that `VITE_SUPABASE_URL` is set correctly in your `.env` file
   - Ensure the URL format is: `https://your-project-id.supabase.co`
   - Restart your development server after adding environment variables

2. **Real-time Notifications Not Working**:
   - Verify Supabase credentials are correct
   - Check browser console for Supabase connection errors
   - Ensure real-time is enabled for the notifications table in Supabase

3. **Admin Dashboard Not Accessible**:
   - Verify your user has `role='admin'` in the backend
   - Check that admin API endpoints are working
   - Ensure JWT token is valid and not expired

4. **API Errors**:
   - Check that backend server is running
   - Verify API base URL in environment variables
   - Check network tab for specific error details

## 📝 Notes

1. **Supabase Integration**: Real-time notifications require Supabase setup
2. **Backend Dependencies**: Admin features require corresponding backend endpoints
3. **Role Management**: Admin role must be set in the backend user model
4. **Environment Variables**: Supabase credentials must be configured
5. **Real-time Events**: Notifications are published to user-specific channels

## 🔄 Future Enhancements

1. **Push Notifications**: Browser push notifications
2. **Email Notifications**: Email integration for important notifications
3. **Advanced Filtering**: More granular notification filters
4. **Bulk Actions**: Bulk user and post management
5. **Analytics**: More detailed admin analytics
6. **Audit Logs**: Admin action logging
7. **Content Moderation**: Advanced content filtering
8. **User Reports**: User reporting system
