import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

const defaultProps = {
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

export const DownloadIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const Code2Icon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M6.34 17.66l-1.41 1.41" />
    <path d="M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M12 3l1.912 5.885L19.797 10.8 13.912 12.715 12 18.6 10.088 12.715 4.203 10.8l5.885-1.915L12 3z" />
    <path d="M5 3v4" />
    <path d="M3 5h4" />
    <path d="M19 17v4" />
    <path d="M17 19h4" />
  </svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const ArrowUpRightIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill="currentColor"
    />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Loader2Icon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

export const MonitorIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const LayersIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const CpuIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} {...defaultProps} className={className} {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M15 2v2" />
    <path d="M9 2v2" />
    <path d="M20 15h2" />
    <path d="M20 9h2" />
    <path d="M15 20v2" />
    <path d="M9 20v2" />
    <path d="M2 15h2" />
    <path d="M2 9h2" />
  </svg>
);

export const GithubIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);
