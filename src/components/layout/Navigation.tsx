import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Plus, Shield, LogOut, Users, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Avatar from '../ui/Avatar';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/feed" className="text-xl font-bold text-blue-600">
              SocialConnect
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/feed"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/feed')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Feed</span>
            </Link>
            
            <Link
              to="/create-post"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/create-post')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </Link>
            
            <Link
              to="/discover"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/discover')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Discover</span>
            </Link>
            
            <Link
              to={`/profile/${user?.id}`}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(`/profile/${user?.id}`)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <NotificationDropdown />
            
            {/* Admin Dashboard Link (only for admin users) */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`hidden md:flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
            
            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Avatar src={user?.avatar_url} alt={user?.username || 'User'} size="sm" />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    to={`/profile/${user?.id}`}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    to="/change-password"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Change Password</span>
                  </Link>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg absolute top-full left-0 right-0 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link
              to="/feed"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                isActive('/feed')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Feed</span>
            </Link>
            
            <Link
              to="/create-post"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                isActive('/create-post')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Create Post</span>
            </Link>
            
            <Link
              to="/discover"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                isActive('/discover')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Discover</span>
            </Link>
            
            <Link
              to={`/profile/${user?.id}`}
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                isActive(`/profile/${user?.id}`)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>

            {/* Admin Dashboard Link for Mobile */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive('/admin')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            )}

            <hr className="my-2" />

            {/* Mobile User Info */}
            <div className="px-3 py-2">
              <div className="flex items-center space-x-3">
                <Avatar src={user?.avatar_url} alt={user?.username || 'User'} size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <Link
              to="/change-password"
              onClick={closeMobileMenu}
              className="flex items-center space-x-3 px-3 py-3 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <Shield className="w-5 h-5" />
              <span>Change Password</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-3 text-base text-red-600 hover:bg-red-50 w-full text-left rounded-md"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
