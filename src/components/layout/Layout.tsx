import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-10">
        {children}
      </main>
      <footer className="border-t py-8 mt-auto hidden md:block">
        <div className="container text-center text-sm text-muted-foreground">
          <p>LoFoNet - Lost & Found System. All rights reserved.</p>
          <p className="mt-1">Powered by Artificial Intelligence</p>
        </div>
      </footer>
      <BottomNavigation />
    </div>
  );
}