import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedApi } from '../api/feedApi';
import { engagementApi } from '../api/engagementApi';
import { FeedPost, FeedResponse } from '../types/posts';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Layout from '../components/layout/Layout';
import { Heart, MessageCircle, Plus, RefreshCw } from 'lucide-react';

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError('');
      const response: FeedResponse = await feedApi.getFeed({
        page: pageNum,
        page_size: 10
      });

      if (append) {
        setPosts(prev => [...prev, ...response.results]);
      } else {
        setPosts(response.results);
      }

      setHasMore(!!response.next);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFeed(1, false);
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return;
    await fetchFeed(page + 1, true);
  };

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked_by_user) {
        await engagementApi.unlikePost(postId);
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_liked_by_user: false, like_count: p.like_count - 1 }
            : p
        ));
      } else {
        await engagementApi.likePost(postId);
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, is_liked_by_user: true, like_count: p.like_count + 1 }
            : p
        ));
      }
    } catch (err: any) {
      console.error('Failed to update like:', err);
      
      // Show user-friendly error message
      if (err.response?.status === 400) {
        const errorMessage = err.response.data?.detail || 'Unable to like this post';
        alert(errorMessage);
      } else if (err.response?.status === 401) {
        alert('Please log in to like posts');
      } else {
        alert('An error occurred while updating the like');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading your feed...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary-600">Feed</h1>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/create-post')}>
              <Plus size={16} className="mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button 
                onClick={handleRefresh}
                variant="secondary"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Refresh Loading Overlay */}
        {isRefreshing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="text-secondary-600">Refreshing feed...</span>
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-secondary-800 mb-2">
                Your feed is empty
              </h2>
              <p className="text-secondary-600 mb-6">
                Start following other users to see their posts here, or create your first post!
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/create-post')}>
                  <Plus size={16} className="mr-2" />
                  Create Post
                </Button>
                <Button variant="secondary" onClick={() => navigate('/discover')}>
                  Discover Users
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div 
                    className="cursor-pointer"
                    onClick={() => navigate(`/profile/${post.author_id}`)}
                  >
                    <Avatar 
                      src={post.author_avatar} 
                      alt={post.author_username}
                      size="md"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="font-semibold text-primary-600 cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${post.author_id}`)}
                      >
                        {post.author_username}
                      </span>
                      <Badge variant="secondary" size="sm">
                        {post.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary-500">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-secondary-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post Image */}
                {post.image_url && (
                  <div className="mb-4">
                    <img 
                      src={post.image_url} 
                      alt="Post image"
                      className="w-full rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => navigate(`/post/${post.id}`)}
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        post.is_liked_by_user
                          ? 'text-red-600 bg-red-50'
                          : 'text-secondary-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Heart 
                        size={18} 
                        className={post.is_liked_by_user ? 'fill-current' : ''} 
                      />
                      <span className="text-sm font-medium">
                        {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                      </span>
                    </button>

                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm font-medium">
                        {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                      </span>
                    </button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    View Post
                  </Button>
                </div>
              </Card>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={handleLoadMore}
                  variant="secondary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Feed;
