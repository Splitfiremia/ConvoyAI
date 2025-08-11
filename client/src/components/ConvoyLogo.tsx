// Convoy AI Logo Component - Network Nodes Design (Option 5)
// Represents connected network nodes for AI communication

interface ConvoyLogoProps {
  size?: number;
  className?: string;
}

export default function ConvoyLogo({ size = 32, className = "" }: ConvoyLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      className={`flex-shrink-0 ${className}`}
    >
      <rect width="40" height="40" rx="8" fill="#3B82F6" />
      <circle cx="12" cy="12" r="3" fill="white" />
      <circle cx="28" cy="12" r="3" fill="white" />
      <circle cx="20" cy="20" r="4" fill="white" />
      <circle cx="12" cy="28" r="3" fill="white" />
      <circle cx="28" cy="28" r="3" fill="white" />
      <line x1="15" y1="14" x2="17" y2="18" stroke="white" strokeWidth="1.5" />
      <line x1="25" y1="14" x2="23" y2="18" stroke="white" strokeWidth="1.5" />
      <line x1="17" y1="22" x2="15" y2="26" stroke="white" strokeWidth="1.5" />
      <line x1="23" y1="22" x2="25" y2="26" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

// Alternative compact version for small spaces
export function ConvoyLogoCompact({ size = 24, className = "" }: ConvoyLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={`flex-shrink-0 ${className}`}
    >
      <rect width="24" height="24" rx="4" fill="#3B82F6" />
      <circle cx="7" cy="7" r="1.5" fill="white" />
      <circle cx="17" cy="7" r="1.5" fill="white" />
      <circle cx="12" cy="12" r="2" fill="white" />
      <circle cx="7" cy="17" r="1.5" fill="white" />
      <circle cx="17" cy="17" r="1.5" fill="white" />
      <line x1="9" y1="8" x2="10" y2="11" stroke="white" strokeWidth="1" />
      <line x1="15" y1="8" x2="14" y2="11" stroke="white" strokeWidth="1" />
      <line x1="10" y1="13" x2="9" y2="16" stroke="white" strokeWidth="1" />
      <line x1="14" y1="13" x2="15" y2="16" stroke="white" strokeWidth="1" />
    </svg>
  );
}