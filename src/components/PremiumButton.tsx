import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Spinner } from './ui';

// ─── Premium Button Component ─────────────────────────────────────────────────────

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function PremiumButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false
}: PremiumButtonProps) {
  const { currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-base';
      default:
        return 'px-6 py-3 text-sm';
    }
  };

  const getVariantStyles = () => {
    const baseClasses = `
      relative inline-flex items-center justify-center font-medium
      rounded-xl transition-all duration-200 ease-out
      transform-gpu backdrop-blur-sm border
      ${fullWidth ? 'w-full' : ''}
      ${getSizeClasses()}
      ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
    `;

    const hoverTransform = isHovered && !disabled && !loading ? 'scale-[1.02]' : '';
    const pressedTransform = isPressed && !disabled && !loading ? 'scale-[0.98]' : '';

    switch (variant) {
      case 'primary':
        return `
          ${baseClasses}
          bg-primary bg-opacity-90 text-textPrimary border-primary
          hover:bg-opacity-100 hover:shadow-lg
          ${hoverTransform} ${pressedTransform}
        `;
      
      case 'secondary':
        return `
          ${baseClasses}
          bg-surface bg-opacity-80 text-textPrimary border-surfaceBorder
          hover:bg-opacity-100 hover:border-primary
          ${hoverTransform} ${pressedTransform}
        `;
      
      case 'outline':
        return `
          ${baseClasses}
          bg-transparent text-primary border-primary
          hover:bg-primary hover:bg-opacity-10
          ${hoverTransform} ${pressedTransform}
        `;
      
      case 'ghost':
        return `
          ${baseClasses}
          bg-transparent text-textSecondary border-transparent
          hover:bg-surface hover:bg-opacity-60 hover:text-textPrimary
          ${hoverTransform} ${pressedTransform}
        `;
      
      default:
        return baseClasses;
    }
  };

  const getButtonStyles = () => {
    const styles: React.CSSProperties = {
      boxShadow: isHovered && !disabled && !loading
        ? `0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px ${currentTheme.colors.shadowGlow}`
        : '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)'
    };

    if (variant === 'primary' && isHovered && !disabled && !loading) {
      styles.boxShadow += `, inset 0 0 20px ${currentTheme.colors.primary}40`;
    }

    return styles;
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconClasses = `
      transition-all duration-200
      ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}
      ${loading ? 'opacity-0' : 'opacity-100'}
    `;

    return <span className={iconClasses}>{icon}</span>;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`${getVariantStyles()} ${className}`}
      style={getButtonStyles()}
    >
      {/* Glow Effect */}
      {(variant === 'primary' || variant === 'outline') && isHovered && !disabled && !loading && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.shadowGlow} 0%, transparent 50%)`,
            filter: 'blur(16px)'
          }}
        />
      )}

      {/* Ripple Effect */}
      {isPressed && !disabled && !loading && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${currentTheme.colors.primary}40 0%, transparent 70%)`,
            filter: 'blur(8px)'
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {iconPosition === 'left' && renderIcon()}
        
        {loading ? (
          <Spinner size={4} />
        ) : (
          <span className="font-medium">{children}</span>
        )}
        
        {iconPosition === 'right' && renderIcon()}
      </div>
    </button>
  );
}

// ─── Premium Icon Button Component ─────────────────────────────────────────────────

interface PremiumIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function PremiumIconButton({
  icon,
  onClick,
  tooltip,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = ''
}: PremiumIconButtonProps) {
  const { currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 p-1.5';
      case 'lg':
        return 'w-12 h-12 p-3';
      default:
        return 'w-10 h-10 p-2';
    }
  };

  const getVariantStyles = () => {
    const baseClasses = `
      relative inline-flex items-center justify-center
      rounded-lg transition-all duration-200 ease-out
      transform-gpu backdrop-blur-sm border
      ${getSizeClasses()}
      ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
    `;

    const hoverTransform = isHovered && !disabled ? 'scale-110' : '';

    switch (variant) {
      case 'primary':
        return `
          ${baseClasses}
          bg-primary bg-opacity-90 text-textInverse border-primary
          hover:bg-opacity-100
          ${hoverTransform}
        `;
      
      case 'secondary':
        return `
          ${baseClasses}
          bg-surface bg-opacity-80 text-textPrimary border-surfaceBorder
          hover:bg-opacity-100 hover:border-primary
          ${hoverTransform}
        `;
      
      case 'ghost':
        return `
          ${baseClasses}
          bg-transparent text-textSecondary border-transparent
          hover:bg-surface hover:bg-opacity-60 hover:text-textPrimary
          ${hoverTransform}
        `;
      
      default:
        return baseClasses;
    }
  };

  const getButtonStyles = () => {
    return {
      boxShadow: isHovered && !disabled
        ? `0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 12px ${currentTheme.colors.shadowGlow}`
        : '0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)'
    };
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${getVariantStyles()} ${className}`}
      style={getButtonStyles()}
      title={tooltip}
    >
      {/* Glow Effect */}
      {(variant === 'primary' || variant === 'secondary') && isHovered && !disabled && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.shadowGlow} 0%, transparent 50%)`,
            filter: 'blur(12px)'
          }}
        />
      )}

      {/* Icon */}
      <div className="relative z-10">
        {icon}
      </div>
    </button>
  );
}
