import React, { useState, useEffect } from 'react';
import { Search, Eye, UserCheck, UserX, Shield, ShieldOff } from 'lucide-react';
import { AdminUser, AdminUserDetail, AdminUserUpdateRequest } from '../../types/admin';
import { adminApi } from '../../api/adminApi';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface UserManagementProps {
  className?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className = '' }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: 20,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        is_active: statusFilter !== 'all' ? statusFilter === 'active' : undefined
      };

      console.log('Loading users with params:', params);
      const response = await adminApi.getUsers(params);
      console.log('API Response:', response);
      
      if (page === 1) {
        setUsers(response.results);
      } else {
        setUsers(prev => [...prev, ...response.results]);
      }
      setHasMore(!!response.next);
    } catch (error: any) {
      console.error('Error loading users:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show user-friendly error message
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        alert('Access denied. You need admin privileges to view this page.');
      } else if (error.response?.status === 404) {
        alert('Admin API endpoint not found. Please check if the backend is running.');
      } else {
        alert(`Error loading users: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate' | 'makeAdmin' | 'removeAdmin') => {
    try {
      const updateData: AdminUserUpdateRequest = {};
      
      if (action === 'activate') updateData.is_active = true;
      if (action === 'deactivate') updateData.is_active = false;
      if (action === 'makeAdmin') updateData.role = 'admin';
      if (action === 'removeAdmin') updateData.role = 'user';

      await adminApi.updateUser(userId, updateData);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              is_active: action === 'activate' ? true : action === 'deactivate' ? false : user.is_active,
              role: action === 'makeAdmin' ? 'admin' : action === 'removeAdmin' ? 'user' : user.role
            }
          : user
      ));

      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? {
          ...prev,
          is_active: action === 'activate' ? true : action === 'deactivate' ? false : prev.is_active,
          role: action === 'makeAdmin' ? 'admin' : action === 'removeAdmin' ? 'user' : prev.role
        } : null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const viewUserDetails = async (userId: number) => {
    try {
      const userDetails = await adminApi.getUserDetails(userId);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
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

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && page === 1 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'There are no users in the system yet.'}
            </p>
            {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setPage(1);
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar src={user.avatar_url} alt={user.username} size="sm" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={user.role === 'admin' ? 'primary' : 'secondary'}
                      className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={user.is_active ? 'success' : 'danger'}
                      className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.date_joined)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <span>{user.posts_count} posts</span>
                      <span>{user.followers_count} followers</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        onClick={() => viewUserDetails(user.id)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {user.is_active ? (
                        <Button
                          onClick={() => handleUserAction(user.id, 'deactivate')}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {user.role === 'user' ? (
                        <Button
                          onClick={() => handleUserAction(user.id, 'makeAdmin')}
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUserAction(user.id, 'removeAdmin')}
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {hasMore && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Button
              onClick={() => setPage(prev => prev + 1)}
              variant="outline"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <Button
                onClick={() => setShowUserModal(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar src={selectedUser.avatar_url} alt={selectedUser.username} size="lg" />
                <div>
                  <h4 className="text-xl font-semibold">{selectedUser.username}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-sm">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm">{selectedUser.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <p className="text-sm">{formatDate(selectedUser.date_joined)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-sm">{formatDate(selectedUser.last_login)}</p>
                </div>
              </div>
              
              {selectedUser.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="text-sm">{selectedUser.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedUser.posts_count}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedUser.followers_count}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedUser.following_count}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
