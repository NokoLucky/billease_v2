'use client';

import { AuthProvider } from '@/components/auth-provider';
import { SideNav } from '@/components/side-nav';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
    >
      <AuthProvider>
        <SidebarProvider>
          <Sidebar>
            <SideNav />
          </Sidebar>
          <SidebarInset style={{ paddingTop: 'env(safe-area-inset-top)'}}>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
