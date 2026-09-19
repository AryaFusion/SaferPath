import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'caution' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) => {
  let variantStyles = 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-transparent';

  if (variant === 'secondary') {
    variantStyles = 'bg-white text-[#172033] hover:bg-[#F7FAFF] border border-[#DCE3EE]';
  } else if (variant === 'outline') {
    variantStyles = 'bg-white text-[#172033] hover:bg-[#F7FAFF] border border-[#DCE3EE]';
  } else if (variant === 'caution') {
    variantStyles = 'bg-[#C62828] text-white hover:bg-red-800 border-transparent font-medium';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent text-[#64748B] hover:text-[#172033] hover:bg-[#EFF6FF] border-transparent';
  }

  let sizeStyles = 'px-3.5 py-2 text-xs rounded-md font-medium';
  if (size === 'sm') sizeStyles = 'px-2.5 py-1.5 text-xs rounded-md font-medium';
  if (size === 'lg') sizeStyles = 'px-5 py-2.5 text-sm rounded-md font-semibold';

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 leading-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="inline-flex items-center leading-none">{children}</span>
    </button>
  );
};

export default Button;
