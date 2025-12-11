import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, header, className = '' }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex justify-center w-full overflow-hidden">
      <div className="w-full max-w-md bg-slate-950 flex flex-col relative h-screen shadow-2xl shadow-black">
        {header && (
          <header className="p-4 pt-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800">
            {header}
          </header>
        )}
        <main className={`flex-1 flex flex-col p-6 overflow-y-auto safe-bottom ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;