import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

const defaultProps = {
  width: '100%',
  height: '100%',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.75',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const CompassIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4.35-4.35" />
  </svg>
);

export const PackageIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M12.89 2.21a2 2 0 00-1.78 0l-7 3.5A2 2 0 003 7.51v8.98a2 2 0 001.11 1.79l7 3.5a2 2 0 001.78 0l7-3.5A2 2 0 0021 16.49V7.51a2 2 0 00-1.11-1.79l-7-3.5z" />
    <path d="M3.27 6.96L12 11.5l8.73-4.54" />
    <path d="M12 22.08V11.5" />
  </svg>
);

export const RefreshCwIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M21.5 2v6h-6" />
    <path d="M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.19" />
  </svg>
);

export const ActivityIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8z" />
    <path d="M19 3c0 2-1.5 3.5-3.5 3.5C17.5 6.5 19 8 19 10c0-2 1.5-3.5 3.5-3.5C20.5 6.5 19 5 19 3z" />
    <path d="M5 17c0 1.5-1 2.5-2.5 2.5C4 19.5 5 20.5 5 22c0-1.5 1-2.5 2.5-2.5C6 19.5 5 18.5 5 17z" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const CheckCircle2Icon = CheckCircleIcon;

export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const GitForkIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M18 9v2c0 1.66-1.34 3-3 3H9c-1.66 0-3-1.34-3-3V9" />
    <path d="M12 15v3" />
  </svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

export const SlidersIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export const SlidersHorizontal = SlidersIcon;

export const TerminalIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const Trash2Icon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const SquareIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const FolderOpenIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    <path d="M2 10h20" />
  </svg>
);

export const Code2Icon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

export const CpuIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const TrendingUpIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const MonitorIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <rect x="2" y="3" width="20" height="14" rx="3" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export const PaletteIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.66-.75 1.66-1.67 0-.42-.16-.8-.43-1.09-.27-.29-.43-.68-.43-1.11 0-.92.75-1.67 1.67-1.67H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9.03-10-8.97z" />
  </svg>
);

export const HardDriveIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <line x1="22" y1="12" x2="2" y2="12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    <line x1="6" y1="16" x2="6.01" y2="16" strokeWidth="2.5" />
    <line x1="10" y1="16" x2="10.01" y2="16" strokeWidth="2.5" />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" />
  </svg>
);

export const Loader2Icon: React.FC<IconProps> = ({ size = 20, className = 'animate-spin', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

export const ArrowUpRightIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export const LayersIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
