import type { ReactNode } from 'react';

export interface WadahHalamanProps {
  children: ReactNode;
  className?: string;
}

export function WadahHalaman({ children, className = '' }: WadahHalamanProps) {
  return (
    <div className={`w-full px-3.5 sm:px-6 lg:px-8 py-6 ${className}`}>
      {children}
    </div>
  );
}
