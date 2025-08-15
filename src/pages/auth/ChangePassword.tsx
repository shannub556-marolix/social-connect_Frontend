import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return false;
    }
    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.new_password)) {
      setError('New password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    if (formData.old_password === formData.new_password) {
      setError('New password must be different from the old password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      
      setSuccess('Password changed successfully!');
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/feed');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Password change failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">Change Password</h1>
            <p className="text-secondary-600">
              Update your password to keep your account secure.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Current Password"
              name="old_password"
              type={showOldPassword ? 'text' : 'password'}
              value={formData.old_password}
              onChange={handleInputChange}
              leftIcon={<Lock size={20} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              placeholder="Enter current password"
              required
            />

            <Input
              label="New Password"
              name="new_password"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.new_password}
              onChange={handleInputChange}
              leftIcon={<Lock size={20} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              placeholder="Enter new password"
              helperText="At least 8 characters with uppercase, lowercase, and number"
              required
            />

            <Input
              label="Confirm New Password"
              name="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleInputChange}
              leftIcon={<Lock size={20} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              placeholder="Confirm new password"
              required
            />

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={!formData.old_password || !formData.new_password || !formData.confirm_password}
            >
              Change Password
            </Button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/feed')}
              className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-700 font-medium"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Feed
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
