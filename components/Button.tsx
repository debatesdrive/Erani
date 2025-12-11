import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  fullWidth?: boolean;
  size?: 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'lg',
  className = '',
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 focus:ring-blue-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50 focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50 focus:ring-green-500',
    outline: 'border-2 border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white bg-transparent',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800',
  };

  const sizes = {
    md: 'h-12 px-6 text-base',
    lg: 'h-16 px-8 text-lg',
    xl: 'h-20 px-10 text-xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="ml-3">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;