// Custom Vector Icons for Game Modes
import React from 'react';

export const ClassicIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Infinity knot with snake head */}
    <path 
      d="M12 24C12 20 15 17 19 17C23 17 24 20 24 24C24 28 25 31 29 31C33 31 36 28 36 24C36 20 33 17 29 17C25 17 24 20 24 24C24 28 23 31 19 31C15 31 12 28 12 24Z" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    {/* Snake head */}
    <circle cx="36" cy="24" r="3" fill="currentColor" />
    <circle cx="35" cy="23" r="0.8" fill="#1a1f2e" />
    <circle cx="37" cy="23" r="0.8" fill="#1a1f2e" />
  </svg>
);

export const TimedIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Clock face */}
    <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="2.5" />
    {/* Clock hands */}
    <line x1="24" y1="24" x2="24" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="24" y1="24" x2="30" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Loading ring segments */}
    <path d="M24 8 A16 16 0 0 1 36 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    <path d="M36 12 A16 16 0 0 1 40 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <path d="M40 24 A16 16 0 0 1 36 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <path d="M36 36 A16 16 0 0 1 24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
    <path d="M24 40 A16 16 0 0 1 12 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 36 A16 16 0 0 1 8 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MultiplayerIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left avatar */}
    <circle cx="16" cy="20" r="5" stroke="currentColor" strokeWidth="2.5" />
    <path d="M8 34C8 29 11.5 26 16 26C20.5 26 24 29 24 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Right avatar */}
    <circle cx="32" cy="20" r="5" stroke="currentColor" strokeWidth="2.5" />
    <path d="M24 34C24 29 27.5 26 32 26C36.5 26 40 29 40 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* VS symbol */}
    <text x="24" y="27" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">VS</text>
  </svg>
);

export const ZenIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lotus/geometric swirl */}
    <path 
      d="M24 8C24 8 20 14 20 20C20 26 24 28 24 28C24 28 28 26 28 20C28 14 24 8 24 8Z" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    <path 
      d="M16 16C16 16 18 22 22 24C26 26 28 24 28 24" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    <path 
      d="M32 16C32 16 30 22 26 24C22 26 20 24 20 24" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    {/* Base */}
    <ellipse cx="24" cy="36" rx="8" ry="2" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

// Difficulty pip icons
export const DifficultyPips = ({ level, className = "flex gap-1" }: { level: 1 | 2 | 3 | 4; className?: string }) => {
  const pips = [];
  
  if (level === 1) {
    pips.push(<div key="1" className="w-2 h-2 bg-current rounded-sm" />);
  } else if (level === 2) {
    pips.push(<div key="1" className="w-2 h-2 bg-current rounded-sm" />);
    pips.push(<div key="2" className="w-2 h-2 bg-current rounded-sm" />);
  } else if (level === 3) {
    pips.push(<div key="1" className="w-2 h-2 bg-current rounded-sm" />);
    pips.push(<div key="2" className="w-2 h-2 bg-current rounded-sm" />);
    pips.push(<div key="3" className="w-2 h-2 bg-current rounded-sm" />);
  } else if (level === 4) {
    // Pyramid shape
    pips.push(<div key="1" className="w-2 h-2 bg-current rounded-sm" />);
    pips.push(<div key="2" className="w-2 h-2 bg-current rounded-sm" />);
    pips.push(<div key="3" className="w-2 h-2 bg-current rounded-sm" />);
    pips.push(<div key="4" className="w-2 h-2 bg-current rounded-sm" />);
  }
  
  return <div className={className}>{pips}</div>;
};

// Play arrow icon
export const PlayArrowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V19L19 12L8 5Z" />
  </svg>
);
