// Custom SVG Icons for Wooden UI
import React from 'react';

// Classic Mode - Snake Head Infinity Knot
export const ClassicIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20 32C20 26 24 22 28 22C32 22 34 26 34 32C34 38 36 42 40 42C44 42 48 38 48 32C48 26 44 22 40 22C36 22 34 26 34 32C34 38 32 42 28 42C24 42 20 38 20 32Z" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="48" cy="32" r="4" fill="currentColor" />
    <circle cx="47" cy="31" r="1.5" fill="#3d2817" />
    <circle cx="49" cy="31" r="1.5" fill="#3d2817" />
  </svg>
);

// Timed Mode - Golden Pocket Watch
export const TimedIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="3" fill="none" />
    <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" />
    <line x1="32" y1="32" x2="32" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="32" y1="32" x2="40" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="12" r="2" fill="currentColor" />
    <line x1="32" y1="14" x2="32" y2="16" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Multiplayer Mode - VS Users
export const MultiplayerIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="24" r="6" stroke="currentColor" strokeWidth="3" fill="none" />
    <path d="M12 42C12 36 16 32 22 32C28 32 32 36 32 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    
    <circle cx="42" cy="24" r="6" stroke="currentColor" strokeWidth="3" fill="none" />
    <path d="M32 42C32 36 36 32 42 32C48 32 52 36 52 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    
    <text x="32" y="36" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">VS</text>
  </svg>
);

// Zen Mode - Geometric Lotus
export const ZenIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M32 12C32 12 26 20 26 28C26 36 32 40 32 40C32 40 38 36 38 28C38 20 32 12 32 12Z" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round"
      fill="none"
    />
    <path 
      d="M20 20C20 20 24 28 30 32C36 36 40 32 40 32" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round"
      fill="none"
    />
    <path 
      d="M44 20C44 20 40 28 34 32C28 36 24 32 24 32" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round"
      fill="none"
    />
    <ellipse cx="32" cy="48" rx="12" ry="3" stroke="currentColor" strokeWidth="3" fill="none" />
  </svg>
);

// Feature Icons
export const TrophyIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const TitleIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12h20" />
    <path d="M12 2v20" />
    <path d="M4.93 4.93l14.14 14.14" />
    <path d="M19.07 4.93L4.93 19.07" />
  </svg>
);

export const HeroIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
);

export const ChestIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M3 12h18" />
    <path d="M12 8v4" />
    <circle cx="12" cy="14" r="1" />
  </svg>
);

export const ShopIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const EventsIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const RanksIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const PassIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

export const AchieveIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export const SpinIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
  </svg>
);

export const ThemesIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const PremiumIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

export const MapsIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

// Play Arrow Icon
export const PlayArrowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5V19L19 12L8 5Z" />
  </svg>
);
