import React, { useState } from 'react';
import { User } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackGradient?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackText,
  fallbackGradient = 'from-slate-800 to-slate-900',
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    const trimmed = (fallbackText || '').trim();
    const initials = trimmed
      ? trimmed
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : '';

    return (
      <div
        className={`bg-gradient-to-br ${fallbackGradient} flex items-center justify-center font-bold text-white/90 select-none ${className}`}
        title={alt || fallbackText || 'Mtumiaji'}
      >
        {initials ? (
          <span className="text-sm font-black tracking-wider">{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-slate-400 stroke-[2]" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      {...props}
    />
  );
};
