import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackGradient?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackText,
  fallbackGradient = 'from-purple-900 to-indigo-900',
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    const initials = fallbackText
      ? fallbackText
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'Z';

    return (
      <div
        className={`bg-gradient-to-br ${fallbackGradient} flex items-center justify-center font-bold text-white/90 select-none ${className}`}
        title={alt || fallbackText}
      >
        <span className="text-xs tracking-wider">{initials}</span>
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
