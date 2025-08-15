import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'User avatar', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const baseClasses = 'rounded-full object-cover bg-gray-200 flex items-center justify-center';
  const sizeClass = sizeClasses[size];

  if (!src) {
    return (
      <div className={`${baseClasses} ${sizeClass} ${className}`}>
        <User className="text-gray-500" size={size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 32} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${baseClasses} ${sizeClass} ${className}`}
      onError={(e) => {
        // Fallback to default avatar on error
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.nextElementSibling?.classList.remove('hidden');
      }}
    />
  );
};

export default Avatar;
