import React, { useState, useEffect } from 'react';
import { Search, Trash2, Eye, Heart, MessageCircle } from 'lucide-react';
import { AdminPost, AdminPostDetail } from '../../types/admin';
import { adminApi } from '../../api/adminApi';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface PostManagementProps {
  className?: string;
}

const PostManagement: React.FC<PostManagementProps> = ({ className = '' }) => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<AdminPostDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState<number | null>(null);

  useEffect(() => {
    loadPosts();
  }, [page, searchTerm, categoryFilter, statusFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: 20,
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        is_active: statusFilter !== 'all' ? statusFilter === 'active' : undefined
      };

      const response = await adminApi.getPosts(params);
      if (page === 1) {
        setPosts(response.results);
      } else {
        setPosts(prev => [...prev, ...response.results]);
      }
      setHasMore(!!response.next);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPost(postId);
      await adminApi.deletePost(postId);
      
      // Remove from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      if (selectedPost?.id === postId) {
        setShowPostModal(false);
        setSelectedPost(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPost(null);
    }
  };

  const viewPostDetails = async (postId: number) => {
    try {
      const postDetails = await adminApi.getPostDetails(postId);
      setSelectedPost(postDetails);
      setShowPostModal(true);
    } catch (error) {
      console.error('Error loading post details:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Management</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="technology">Technology</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="news">News</option>
            <option value="entertainment">Entertainment</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {post.image_url && (
              <div className="h-48 bg-gray-200">
                <img 
                  src={post.image_url} 
                  alt="Post" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Avatar src={post.author_avatar || undefined} alt={post.author_username} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{post.author_username}</p>
                    <p className="text-xs text-gray-500">{post.author_email}</p>
                  </div>
                </div>
                <Badge 
                  variant={post.is_active ? 'default' : 'destructive'}
                  className={post.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {post.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {truncateText(post.content, 150)}
              </p>
              
              {post.category && (
                <div className="mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    {post.like_count}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {post.comment_count}
                  </span>
                </div>
                <span>{formatDate(post.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                <Button
                  onClick={() => viewPostDetails(post.id)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => handleDeletePost(post.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  disabled={deletingPost === post.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => setPage(prev => prev + 1)}
            variant="outline"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Post Details Modal */}
      {showPostModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Post Details</h3>
              <Button
                onClick={() => setShowPostModal(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Author Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar src={selectedPost.author_avatar} alt={selectedPost.author_username} size="lg" />
                <div>
                  <h4 className="text-lg font-semibold">{selectedPost.author_username}</h4>
                  <p className="text-gray-600">{selectedPost.author_email}</p>
                </div>
              </div>
              
              {/* Post Content */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Content</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              
              {/* Post Image */}
              {selectedPost.image_url && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Image</h4>
                  <img 
                    src={selectedPost.image_url} 
                    alt="Post" 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
              
              {/* Post Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{selectedPost.like_count}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{selectedPost.comment_count}</div>
                  <div className="text-sm text-gray-600">Comments</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedPost.category || 'No Category'}
                  </div>
                  <div className="text-sm text-gray-600">Category</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedPost.is_active ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
              
              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{formatDate(selectedPost.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated</label>
                  <p className="text-sm">{formatDate(selectedPost.updated_at)}</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  variant="destructive"
                  disabled={deletingPost === selectedPost.id}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deletingPost === selectedPost.id ? 'Deleting...' : 'Delete Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;
