import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../api/postsApi';
import { CreatePostRequest } from '../types/posts';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import Layout from '../components/layout/Layout';
import { X, Upload } from 'lucide-react';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePostRequest>({
    content: '',
    category: 'general'
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'technology', label: 'Technology' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('Please enter some content for your post');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const postData: CreatePostRequest = {
        content: formData.content.trim(),
        category: formData.category
      };

      if (selectedImage) {
        postData.image = selectedImage;
      }

      await postsApi.createPost(postData);
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.content.trim() || selectedImage) {
      if (window.confirm('Are you sure you want to discard this post?')) {
        navigate('/feed');
      }
    } else {
      navigate('/feed');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
        <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary-600">Create Post</h1>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={6}
                placeholder="Share your thoughts, ideas, or experiences..."
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-secondary-500">
                  {formData.content.length}/1000 characters
                </span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Add Image (Optional)
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-secondary-600 mb-1">
                      Click to upload an image
                    </p>
                    <p className="text-sm text-secondary-500">
                      JPEG, PNG up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="flex-1"
                isLoading={isLoading}
                disabled={!formData.content.trim()}
              >
                {isLoading ? 'Creating Post...' : 'Create Post'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePost;
