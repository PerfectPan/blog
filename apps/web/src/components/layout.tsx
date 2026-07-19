import type { ReactNode } from 'react';
import { Footer } from './footer.js';
import { Header } from './header.js';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div>
      <Header />
      <div className='flex min-h-screen flex-col px-6'>
        <main className='flex flex-grow items-center justify-center *:min-h-64 *:min-w-64'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
