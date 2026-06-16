import React from 'react';
import { cn, getInitials, getColorFromSeed } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-body-sm',
  lg: 'w-12 h-12 text-body', xl: 'w-16 h-16 text-h4', '2xl': 'w-24 h-24 text-h2',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'w-2 h-2 border', sm: 'w-2.5 h-2.5 border-[1.5px]', md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2', xl: 'w-4 h-4 border-2', '2xl': 'w-5 h-5 border-[3px]',
};

interface AvatarProps {
  src?: string | null; alt?: string; name?: string; size?: AvatarSize;
  showStatus?: boolean; isOnline?: boolean; className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = 'User avatar', name = '', size = 'md', showStatus = false, isOnline = false, className }) => {
  const initials = getInitials(name);
  const bgColor = getColorFromSeed(name);
  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      {src ? (
        <img src={src} alt={alt} className={cn('rounded-full object-cover ring-2 ring-white dark:ring-neutral-800', sizeClasses[size])} loading="lazy" />
      ) : (
        <div className={cn('rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white dark:ring-neutral-800', sizeClasses[size])} style={{ backgroundColor: bgColor }} role="img" aria-label={alt}>
          {initials}
        </div>
      )}
      {showStatus && (
        <span className={cn('absolute bottom-0 right-0 rounded-full border-white dark:border-neutral-800', statusSizes[size], isOnline ? 'bg-secondary-500' : 'bg-neutral-400')} aria-label={isOnline ? 'Online' : 'Offline'} />
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<{ users: { src?: string; name: string }[]; max?: number; size?: AvatarSize; className?: string }> = ({ users, max = 4, size = 'sm', className }) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((u, i) => <Avatar key={i} src={u.src} name={u.name} size={size} alt={`${u.name}'s avatar`} />)}
      {remaining > 0 && (
        <div className={cn('rounded-full flex items-center justify-center font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 ring-2 ring-white dark:ring-neutral-800', sizeClasses[size])}>+{remaining}</div>
      )}
    </div>
  );
};
