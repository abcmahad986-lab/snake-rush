// Simple SVG Icons for Game Modes and Difficulty
import React from 'react';

// Game Mode Icons - Simple and Clean
export const SimpleClassicIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 24C8 24 12 20 16 20C20 20 20 24 24 24C28 24 28 20 32 20C36 20 40 24 40 24" 
          stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="40" cy="24" r="3" fill="currentColor"/>
  </svg>
);

export const SimpleTimedIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="3"/>
    <line x1="24" y1="24" x2="24" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <line x1="24" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export const SimpleMultiplayerIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="18" r="5" stroke="currentColor" strokeWidth="3"/>
    <path d="M8 32C8 28 11 26 16 26C21 26 24 28 24 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="32" cy="18" r="5" stroke="currentColor" strokeWidth="3"/>
    <path d="M24 32C24 28 27 26 32 26C37 26 40 28 40 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export const SimpleZenIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="3"/>
    <path d="M24 12C24 12 20 18 20 24C20 30 24 36 24 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M24 12C24 12 28 18 28 24C28 30 24 36 24 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export const SimpleSurvivalIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L28 16L40 16L30 24L34 36L24 28L14 36L18 24L8 16L20 16L24 4Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Difficulty Icons - Simple Geometric
export const SimpleEasyIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8"/>
  </svg>
);

export const SimpleMediumIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
  </svg>
);

export const SimpleHardIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 22,22 2,22"/>
  </svg>
);

export const SimpleInsaneIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L15 9L22 9L17 14L19 22L12 18L5 22L7 14L2 9L9 9Z"/>
  </svg>
);
