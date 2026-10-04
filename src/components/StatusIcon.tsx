import React from 'react';

interface StatusIconProps {
  className?: string;
  size?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ className = 'w-5 h-5', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Center status dot */}
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      {/* 4 segmented outer circular arcs (Universal WhatsApp Updates / Status icon) */}
      <path d="M12 3a9 9 0 0 1 7.5 4" />
      <path d="M20.8 11.5a9 9 0 0 1-1.3 8" />
      <path d="M16 21a9 9 0 0 1-8 0" />
      <path d="M4.5 19.5a9 9 0 0 1-1.3-8" />
      <path d="M4.5 7a9 9 0 0 1 7.5-4" />
    </svg>
  );
};
