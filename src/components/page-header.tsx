import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ title, children, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between p-4 border-b pt-safe-top bg-background z-50 sticky top-0',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-3xl font-bold font-headline">{title}</h1>
      </div>
      {children}
    </header>
  );
}
