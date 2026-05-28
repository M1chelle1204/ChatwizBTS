import React from 'react';

interface AvatarProps {
  avatar: string;
  className?: string; // e.g. "w-11 h-11"
  fallbackSizeClass?: string; // e.g. "text-2xl"
}

export default function Avatar({ avatar, className = "w-10 h-10", fallbackSizeClass = "text-base" }: AvatarProps) {
  const isImage = avatar && (
    avatar.startsWith('data:image/') || 
    avatar.startsWith('http://') || 
    avatar.startsWith('https://') || 
    avatar.startsWith('blob:') ||
    avatar.includes('.') || 
    avatar.includes('/')
  );

  if (isImage) {
    return (
      <img
        src={avatar}
        alt="User avatar"
        className={`${className} rounded-full object-cover shrink-0 select-none`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`${className} bg-stone-50 border border-stone-150 rounded-full flex items-center justify-center shrink-0 select-none font-sans ${fallbackSizeClass}`}>
      {avatar || '💜'}
    </div>
  );
}
