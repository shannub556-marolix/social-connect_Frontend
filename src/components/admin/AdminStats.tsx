import React from 'react';
import { Users, FileText, Heart, MessageCircle, TrendingUp, Calendar } from 'lucide-react';
import { AdminStats as AdminStatsType } from '../../types/admin';

interface AdminStatsProps {
  stats: AdminStatsType;
  loading?: boolean;
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats, loading = false }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Posts',
      value: stats.total_posts,
      icon: FileText,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Likes',
      value: stats.total_likes,
      icon: Heart,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Total Comments',
      value: stats.total_comments,
      icon: MessageCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Active Users Today',
      value: stats.active_users_today,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Active Posts Today',
      value: stats.active_posts_today,
      icon: Calendar,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;
