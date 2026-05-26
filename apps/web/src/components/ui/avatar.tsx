import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-16 h-16 text-xl',
      xl: 'w-24 h-24 text-3xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full bg-gray-200 overflow-hidden',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Avatar.displayName = 'Avatar';

const AvatarImage = forwardRef<HTMLImageElement, HTMLAttributes<HTMLImageElement> & { src: string; alt?: string }>(
  ({ className, src, alt, ...props }, ref) => (
    <img
      ref={ref}
      src={src}
      alt={alt || ''}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-medium',
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };