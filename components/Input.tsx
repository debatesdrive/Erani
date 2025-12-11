import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-slate-400 text-sm font-medium pr-1">
        {label}
      </label>
      <div className="relative">
        <input
          className={`w-full h-14 bg-slate-900 border ${
            error ? 'border-red-500' : 'border-slate-700'
          } rounded-xl px-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
            icon ? 'pl-12' : ''
          }`}
          {...props}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-red-400 text-xs pr-1">{error}</span>}
    </div>
  );
};

export default Input;