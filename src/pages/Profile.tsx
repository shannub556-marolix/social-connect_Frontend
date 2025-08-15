import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { authApi } from '../api/authApi';
import { postsApi } from '../api/postsApi';
import { User } from '../types/auth';
import { Post as PostType } from '../types/posts';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Layout from '../components/layout/Layout';
import { 
  Edit, MapPin, Globe, Calendar, Users, FileText, Heart, MessageCircle, 
  MoreVertical, Trash2, Eye, Camera, X, UserMinus
} from 'lucide-react';

// Interface for follow relationship data
interface FollowRelationship {
  id: number;
  follower: User;
  following: User;
  created_at: string;
}

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { refreshCounts } = useNotifications();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    website: '',
    location: '',
    privacy_setting: 'public' as 'public' | 'private' | 'followers_only'
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Followers and Following states
  const [followers, setFollowers] = useState<FollowRelationship[]>([]);
  const [following, setFollowing] = useState<FollowRelationship[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

  // Post management states
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editPostForm, setEditPostForm] = useState({ 
    content: '', 
    category: 'general' as 'general' | 'technology' | 'lifestyle' | 'travel' | 'food' | 'sports' | 'entertainment' | 'business' | 'education' | 'other'
  });
  const [editPostImage, setEditPostImage] = useState<File | null>(null);
  const [editPostImagePreview, setEditPostImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = currentUser && userId === currentUser.id.toString();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        if (isOwnProfile) {
          // Get own profile
          const userData = await authApi.getCurrentUser();
          setProfile(userData);
          setEditForm({
            bio: userData.bio || '',
            website: userData.website || '',
            location: userData.location || '',
            privacy_setting: userData.privacy_setting
          });
        } else if (userId) {
          // Get other user's profile
          const userData = await authApi.getUserProfile(parseInt(userId));
          setProfile(userData);
        }

        // Fetch user's posts
        if (userId) {
          const postsData = await postsApi.getPosts({ author: parseInt(userId) });
          setPosts(postsData.results);
        }
      } catch (err: any) {
        // Handle specific privacy-related errors
        if (err.response?.status === 403) {
          if (err.response?.data?.detail === 'Profile is private.') {
            setError('This profile is private and not accessible.');
          } else if (err.response?.data?.detail === 'Profile is only visible to followers.') {
            setError('This profile is only visible to followers. You need to follow this user to view their profile.');
          } else {
            setError('You do not have permission to view this profile.');
          }
        } else if (err.response?.status === 401) {
          setError('Authentication required to view this profile.');
        } else {
          setError(err.message || 'Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isOwnProfile]);

  // Fetch followers list
  const fetchFollowers = async () => {
    if (!userId) return;
    
    try {
      setIsLoadingFollowers(true);
      const followersData = await authApi.getFollowers(parseInt(userId));
      setFollowers(followersData);
    } catch (err: any) {
      console.error('Failed to fetch followers:', err);
      setError('Failed to load followers');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  // Fetch following list
  const fetchFollowing = async () => {
    if (!userId) return;
    
    try {
      setIsLoadingFollowing(true);
      const followingData = await authApi.getFollowing(parseInt(userId));
      setFollowing(followingData);
    } catch (err: any) {
      console.error('Failed to fetch following:', err);
      setError('Failed to load following');
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  // Handle follow/unfollow from followers/following lists
  const handleFollowFromList = async (targetUserId: number, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        await authApi.unfollowUser(targetUserId);
        // Update the lists
        setFollowers(prev => prev.filter(f => f.follower.id !== targetUserId));
        setFollowing(prev => prev.filter(f => f.following.id !== targetUserId));
        // Update profile counts
        if (profile) {
          setProfile(prev => prev ? { 
            ...prev, 
            followers_count: prev.followers_count - 1 
          } : null);
        }
      } else {
        await authApi.followUser(targetUserId);
        // Refresh the lists to get updated data
        if (showFollowers) {
          fetchFollowers();
        }
        if (showFollowing) {
          fetchFollowing();
        }
        // Update profile counts
        if (profile) {
          setProfile(prev => prev ? { 
            ...prev, 
            followers_count: prev.followers_count + 1 
          } : null);
        }
      }
    } catch (err: any) {
      console.error('Failed to update follow status:', err);
      setError('Failed to update follow status');
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      if (isFollowing) {
        await authApi.unfollowUser(profile.id);
        setIsFollowing(false);
        // Update profile counts
        setProfile(prev => prev ? { 
          ...prev, 
          followers_count: prev.followers_count - 1 
        } : null);
      } else {
        await authApi.followUser(profile.id);
        setIsFollowing(true);
        
        // Update profile counts
        setProfile(prev => prev ? { 
          ...prev, 
          followers_count: prev.followers_count + 1 
        } : null);
        
        // Refresh notification counts after following someone
        setTimeout(() => {
          refreshCounts();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Failed to update follow status:', err);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    try {
      setIsUploadingAvatar(true);
      const result = await authApi.uploadAvatar(avatarFile);
      
      // Update profile with new avatar URL
      if (profile) {
        setProfile({ ...profile, avatar_url: result.avatar_url });
      }
      
      // Clear avatar states
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Show success message
      setError('');
      setSuccessMessage('Profile photo uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = await authApi.updateProfile(editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  // Post management functions
  const handleEditPost = (post: PostType) => {
    setEditingPost(post.id);
    setEditPostForm({
      content: post.content,
      category: post.category
    });
    setEditPostImage(null);
    setEditPostImagePreview(post.image_url || null);
  };

  const handlePostImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setEditPostImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditPostImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    }
  };

  const handleSavePostEdit = async () => {
    if (!editingPost) return;
    
    try {
      setIsSaving(true);
      const updateData = {
        ...editPostForm,
        ...(editPostImage && { image: editPostImage })
      };
      
      const updatedPost = await postsApi.updatePost(editingPost, updateData);
      
      // Update the post in the local state
      setPosts(prev => 
        prev.map(post => 
          post.id === editingPost ? updatedPost : post
        )
      );
      
      setEditingPost(null);
      setEditPostForm({ content: '', category: 'general' });
      setEditPostImage(null);
      setEditPostImagePreview(null);
    } catch (err: any) {
      console.error('Failed to update post:', err);
      setError(err.response?.data?.detail || 'Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      setIsDeleting(true);
      await postsApi.deletePost(postId);
      
      // Remove the post from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      // Update the posts count in profile
      if (profile) {
        setProfile(prev => prev ? { ...prev, posts_count: prev.posts_count - 1 } : null);
      }
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      setError(err.response?.data?.detail || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
          <Card>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Access Restricted</h1>
              <p className="text-secondary-600 mb-6">{error}</p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/feed')}>
                  Back to Feed
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/discover-users')}
                >
                  Discover More Users
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
          <Card>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Not Found</h1>
              <p className="text-secondary-600 mb-6">The profile you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/feed')}>
                Back to Feed
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}
        {/* Profile Header */}
        <Card className="mb-6">
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-6">
            <Avatar 
              src={profile.avatar_url} 
              alt={profile.username}
              size="xl"
              className="flex-shrink-0"
            />
            
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-600">
                      {profile.username}
                    </h1>
                    {!isOwnProfile && (
                      <div className="flex items-center gap-1 justify-center sm:justify-start">
                        {profile.privacy_setting === 'public' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Public Profile
                          </span>
                        )}
                        {profile.privacy_setting === 'followers_only' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Followers Only
                          </span>
                        )}
                        {profile.privacy_setting === 'private' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Private Profile
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-secondary-600 mb-3">{profile.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-secondary-500 justify-center sm:justify-start">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span className="hidden sm:inline">{profile.location}</span>
                        <span className="sm:hidden">{profile.location.length > 15 ? profile.location.substring(0, 15) + '...' : profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-1">
                        <Globe size={16} />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary-600 hidden sm:inline"
                        >
                          {profile.website}
                        </a>
                        <span className="sm:hidden">Website</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span className="hidden sm:inline">Joined {formatDate(profile.created_at || '')}</span>
                      <span className="sm:hidden">Joined {formatDate(profile.created_at || '')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? 'secondary' : 'primary'}
                      className="w-full sm:w-auto"
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                  
                  {isOwnProfile && (
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => {
                    setShowFollowers(true);
                    fetchFollowers();
                  }}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Users size={20} className="text-primary-600" />
                  <span className="font-semibold text-sm sm:text-base">{profile.followers_count}</span>
                  <span className="text-secondary-500 text-xs sm:text-sm">Followers</span>
                </button>
                <button 
                  onClick={() => {
                    setShowFollowing(true);
                    fetchFollowing();
                  }}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Users size={20} className="text-primary-600" />
                  <span className="font-semibold text-sm sm:text-base">{profile.following_count}</span>
                  <span className="text-secondary-500 text-xs sm:text-sm">Following</span>
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <FileText size={20} className="text-primary-600" />
                  <span className="font-semibold text-sm sm:text-base">{profile.posts_count}</span>
                  <span className="text-secondary-500 text-xs sm:text-sm">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && isOwnProfile && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <div className="space-y-6">
              {/* Avatar Upload Section */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Profile Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="relative">
                    <Avatar 
                      src={avatarPreview || profile.avatar_url} 
                      alt={profile.username}
                      size="xl"
                      className="border-2 border-gray-200"
                    />
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                      <Camera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="flex-1 w-full">
                    <div className="space-y-2">
                      <p className="text-sm text-secondary-600 text-center sm:text-left">
                        Upload a new profile photo. Supported formats: JPEG, PNG. Max size: 2MB.
                      </p>
                      
                      {avatarFile && (
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                          <Button
                            onClick={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview(null);
                            }}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Privacy Setting
                </label>
                <select
                  value={editForm.privacy_setting}
                  onChange={(e) => setEditForm({ ...editForm, privacy_setting: e.target.value as 'public' | 'private' | 'followers_only' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="public">Public</option>
                  <option value="followers_only">Followers Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                  Save Changes
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Section */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Posts</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-secondary-600">No posts yet.</p>
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/create-post')}
                  className="mt-4"
                >
                  Create Your First Post
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar 
                      src={post.author.avatar_url} 
                      alt={post.author.username}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-primary-600 truncate">
                            {post.author.username}
                          </span>
                          <Badge variant="secondary" size="sm" className="flex-shrink-0">
                            {post.category}
                          </Badge>
                        </div>
                        
                        {/* Post Actions Menu (only for own posts) */}
                        {isOwnProfile && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleEditPost(post)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <Edit size={14} className="mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <div className="relative group">
                              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <MoreVertical size={16} className="text-gray-500" />
                              </button>
                              
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-1">
                                  <button
                                    onClick={() => navigate(`/post/${post.id}`)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Eye size={16} />
                                    View Post
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(post.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                  >
                                    <Trash2 size={16} />
                                    Delete Post
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-secondary-500">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Post Content - Show edit form if editing */}
                  {editingPost === post.id ? (
                    <div className="mb-3">
                      <textarea
                        value={editPostForm.content}
                        onChange={(e) => setEditPostForm({ ...editPostForm, content: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        rows={4}
                        placeholder="Edit your post content..."
                      />
                      
                      {/* Image Upload Section */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Post Image
                        </label>
                        
                        {/* Current Image Preview */}
                        {editPostImagePreview && (
                          <div className="mb-3">
                            <img 
                              src={editPostImagePreview} 
                              alt="Post image preview"
                              className="w-full max-w-md rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        
                        {/* Image Upload Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <label className="cursor-pointer w-full sm:w-auto">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePostImageChange}
                              className="hidden"
                            />
                            <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">
                              <Camera size={16} className="text-gray-500" />
                              <span className="text-sm text-gray-700">
                                {editPostImagePreview ? 'Change Image' : 'Add Image'}
                              </span>
                            </div>
                          </label>
                          
                          {editPostImagePreview && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditPostImage(null);
                                setEditPostImagePreview(null);
                              }}
                              className="text-red-600 hover:bg-red-50 w-full sm:w-auto"
                            >
                              Remove Image
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          Supported formats: JPEG, PNG. Max size: 5MB.
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                          onClick={handleSavePostEdit}
                          disabled={isSaving || !editPostForm.content.trim()}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingPost(null);
                            setEditPostForm({ content: '', category: 'general' });
                            setEditPostImage(null);
                            setEditPostImagePreview(null);
                          }}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-secondary-800 mb-3">{post.content}</p>
                  )}
                  
                  {/* Show original post image only when not editing */}
                  {post.image_url && editingPost !== post.id && (
                    <img 
                      src={post.image_url} 
                      alt="Post image"
                      className="w-full max-w-md rounded-lg mb-3"
                    />
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-secondary-500">
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      {post.like_count} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      {post.comment_count} comments
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Followers ({profile?.followers_count})
              </h3>
              <button
                onClick={() => setShowFollowers(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoadingFollowers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : followers.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No followers yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followers.map((follow) => (
                    <div key={follow.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                         onClick={() => {
                           setShowFollowers(false);
                           navigate(`/profile/${follow.follower.id}`);
                         }}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar 
                          src={follow.follower.avatar_url} 
                          alt={follow.follower.username}
                          size="md"
                          className="flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 hover:text-primary-600 truncate">
                            {follow.follower.username}
                          </p>
                          {follow.follower.bio && (
                            <p className="text-sm text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">{follow.follower.bio}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* No action button needed for followers list */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Following ({profile?.following_count})
              </h3>
              <button
                onClick={() => setShowFollowing(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoadingFollowing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : following.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Not following anyone yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {following.map((follow) => (
                    <div key={follow.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div 
                          className="cursor-pointer flex-shrink-0"
                          onClick={() => {
                            setShowFollowing(false);
                            navigate(`/profile/${follow.following.id}`);
                          }}
                        >
                          <Avatar 
                            src={follow.following.avatar_url} 
                            alt={follow.following.username}
                            size="md"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p 
                            className="font-semibold text-gray-900 hover:text-primary-600 cursor-pointer truncate"
                            onClick={() => {
                              setShowFollowing(false);
                              navigate(`/profile/${follow.following.id}`);
                            }}
                          >
                            {follow.following.username}
                          </p>
                          {follow.following.bio && (
                            <p className="text-sm text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">{follow.following.bio}</p>
                          )}
                        </div>
                      </div>
                      
                      {currentUser && follow.following.id !== currentUser.id && (
                        <Button
                          onClick={() => handleFollowFromList(follow.following.id, true)}
                          variant="secondary"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <UserMinus size={16} className="mr-1" />
                          <span className="hidden sm:inline">Unfollow</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Post
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeletePost(showDeleteConfirm)}
                disabled={isDeleting}
                className="text-red-600 border-red-300 hover:bg-red-50 w-full sm:w-auto"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default Profile;
