'use client';

import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force dark mode for auth pages
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    return () => {
      // This cleanup is optional since theme provider will handle it
      // but it's good practice for component unmounting
      document.documentElement.classList.remove('dark');
    };
  }, []);

  return (
    <div className="relative h-screen w-full flex-col items-center justify-center grid lg:grid-cols-2 bg-background dark:bg-background">
      {children}
    </div>
  );
} 