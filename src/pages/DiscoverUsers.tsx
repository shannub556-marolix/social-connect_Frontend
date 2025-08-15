import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNotifications } from '../contexts/NotificationContext';
import { authApi } from '../api/authApi';
import { User } from '../types/auth';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Layout from '../components/layout/Layout';
import { formatShortDate } from '../utils/dateUtils';
import { ArrowLeft, Users, MapPin, Globe, Calendar, UserPlus } from 'lucide-react';

const DiscoverUsers: React.FC = () => {
  const navigate = useNavigate();

  const { refreshCounts } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [followingStates, setFollowingStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadDiscoverUsers();
  }, []);

  const loadDiscoverUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const discoverUsers = await authApi.discoverUsers();
      setUsers(discoverUsers);
      
      // Initialize following states from API response
      const initialStates: { [key: number]: boolean } = {};
      discoverUsers.forEach((user: any) => {
        initialStates[user.id] = user.is_following || false;
      });
      setFollowingStates(initialStates);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      if (followingStates[userId]) {
        await authApi.unfollowUser(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: false }));
      } else {
        await authApi.followUser(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: true }));
        
        // Refresh notification counts after following someone
        // This ensures the notification count updates immediately
        setTimeout(() => {
          refreshCounts();
        }, 1000); // Small delay to allow backend to process
      }
    } catch (err: any) {
      console.error('Failed to update follow status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return formatShortDate(dateString);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Discover Users</h1>
            </div>
          </div>
        </div>



        {/* Error Message */}
        {error && (
          <Card className="mb-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button 
                onClick={loadDiscoverUsers}
                variant="secondary"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Privacy Info */}
        <Card className="mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">ℹ</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Privacy Levels
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span><strong>Public:</strong> Full profile visible to everyone</p>
                  <p><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span><strong>Followers Only:</strong> Profile visible only to followers</p>
                  <p><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span><strong>Private:</strong> Profile hidden from non-followers</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Grid */}
        {users.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users to discover
              </h3>
              <p className="text-gray-500 mb-6">
                There are no other users on the platform yet. Check back later!
              </p>
              <Button onClick={() => navigate('/feed')}>
                Back to Feed
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* User Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <Avatar 
                        src={user.avatar_url} 
                        alt={user.username}
                        size="lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600 truncate"
                        onClick={() => navigate(`/profile/${user.id}`)}
                      >
                        {user.username}
                      </h3>
                      {user.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="space-y-2 mb-4">
                    {user.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Globe size={14} />
                        <a 
                          href={user.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary-600 truncate"
                        >
                          {user.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>Joined {formatDate(user.date_joined || '')}</span>
                    </div>
                  </div>

                  {/* Stats and Privacy */}
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div className="flex gap-4">
                      <span>{user.followers_count} followers</span>
                      <span>{user.posts_count} posts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {user.privacy_setting === 'public' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Public
                        </span>
                      )}
                      {user.privacy_setting === 'followers_only' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          Followers Only
                        </span>
                      )}
                      {user.privacy_setting === 'private' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          Private
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Follow Button */}
                  <Button
                    onClick={() => handleFollow(user.id)}
                    variant={followingStates[user.id] ? 'secondary' : 'primary'}
                    size="sm"
                    className="w-full"
                  >
                    <UserPlus size={16} className="mr-2" />
                    {followingStates[user.id] ? 'Unfollow' : 'Follow'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DiscoverUsers;
