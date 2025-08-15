import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsApi } from '../api/postsApi';
import { engagementApi } from '../api/engagementApi';
import { Post } from '../types/posts';
import { Comment, CreateCommentRequest } from '../types/engagement';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Layout from '../components/layout/Layout';
import { Heart, MessageCircle, ArrowLeft, Send, Trash2, Edit } from 'lucide-react';

const PostDetails: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch post details
        const postData = await postsApi.getPost(parseInt(postId));
        setPost(postData);
        setLikeCount(postData.like_count);
        
        // Check like status
        try {
          const likeStatus = await engagementApi.getLikeStatus(parseInt(postId));
          setIsLiked(likeStatus.is_liked);
        } catch (err) {
          // User might not be authenticated, that's okay
          setIsLiked(false);
        }
        
        // Fetch comments
        await fetchComments();
      } catch (err: any) {
        setError(err.message || 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const fetchComments = async () => {
    if (!postId) return;
    
    try {
      setIsLoadingComments(true);
      const response = await engagementApi.getComments(parseInt(postId));
      setComments(response.results);
    } catch (err: any) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!postId) return;
    
    try {
      if (isLiked) {
        await engagementApi.unlikePost(parseInt(postId));
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await engagementApi.likePost(parseInt(postId));
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (err: any) {
      console.error('Failed to update like:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !newComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      const commentData: CreateCommentRequest = {
        content: newComment.trim()
      };
      
      const newCommentData = await engagementApi.createComment(parseInt(postId), commentData);
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!postId) return;
    
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await engagementApi.deleteComment(parseInt(postId), commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!postId || !editCommentText.trim()) return;
    
    try {
      // For now, we'll delete and recreate the comment since the backend doesn't have edit
      // In a real implementation, you'd have an edit endpoint
      await engagementApi.deleteComment(parseInt(postId), commentId);
      const newCommentData = await engagementApi.createComment(parseInt(postId), {
        content: editCommentText.trim()
      });
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? newCommentData : comment
      ));
      setEditingComment(null);
      setEditCommentText('');
    } catch (err: any) {
      setError(err.message || 'Failed to edit comment');
    }
  };

  const canEditComment = (comment: Comment) => {
    return currentUser && (
      comment.user.id === currentUser.id || 
      post?.author.id === currentUser.id
    );
  };

  const canDeleteComment = (comment: Comment) => {
    return currentUser && (
      comment.user.id === currentUser.id || 
      post?.author.id === currentUser.id
    );
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
        day: 'numeric',
        year: 'numeric'
      });
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

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
          <Card>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-secondary-600 mb-6">{error || 'Post not found'}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
        <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => navigate('/feed')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Feed
          </Button>
        </div>

        {/* Post */}
        <Card className="mb-6">
          {/* Post Header */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar 
              src={post.author.avatar_url} 
              alt={post.author.username}
              size="lg"
              className="cursor-pointer"
              onClick={() => navigate(`/profile/${post.author.id}`)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="font-semibold text-primary-600 cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${post.author.id}`)}
                >
                  {post.author.username}
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
            <p className="text-secondary-800 whitespace-pre-wrap text-lg">{post.content}</p>
          </div>

          {/* Post Image */}
          {post.image_url && (
            <div className="mb-4">
              <img 
                src={post.image_url} 
                alt="Post image"
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'text-red-600 bg-red-50'
                  : 'text-secondary-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Heart 
                size={20} 
                className={isLiked ? 'fill-current' : ''} 
              />
              <span className="font-medium">
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-500">
              <MessageCircle size={20} />
              <span className="font-medium">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Comments</h2>

          {/* Add Comment */}
          {currentUser && (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <Avatar 
                  src={currentUser.avatar_url} 
                  alt={currentUser.username}
                  size="md"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-secondary-500">
                      {newComment.length}/500 characters
                    </span>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      <Send size={16} className="mr-1" />
                      {isSubmittingComment ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-secondary-600">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar 
                      src={comment.user.avatar_url} 
                      alt={comment.user.username}
                      size="md"
                      className="cursor-pointer"
                      onClick={() => navigate(`/profile/${comment.user.id}`)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-semibold text-primary-600 cursor-pointer hover:underline"
                            onClick={() => navigate(`/profile/${comment.user.id}`)}
                          >
                            {comment.user.username}
                          </span>
                          <span className="text-sm text-secondary-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        
                        {(canEditComment(comment) || canDeleteComment(comment)) && (
                          <div className="flex gap-2">
                            {canEditComment(comment) && editingComment !== comment.id && (
                              <button
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditCommentText(comment.content);
                                }}
                                className="text-secondary-500 hover:text-primary-600"
                              >
                                <Edit size={14} />
                              </button>
                            )}
                            {canDeleteComment(comment) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-secondary-500 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {editingComment === comment.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            rows={2}
                            maxLength={500}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditComment(comment.id)}
                              disabled={!editCommentText.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setEditingComment(null);
                                setEditCommentText('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-secondary-800">{comment.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetails;
