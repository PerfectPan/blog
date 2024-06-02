import '../styles.css';

import type { ReactNode } from 'react';

import { Footer } from '../components/footer.js';
import { Header } from '../components/header.js';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await getData();

  return (
    <div id='__waku'>
      <meta property='description' content={data.description} />
      <link rel='icon' type='image/png' href={data.icon} />
      <Header />
      <div className='flex flex-col min-h-screen px-6'>
        <main className='flex flex-grow items-center justify-center *:min-h-64 *:min-w-64'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

const getData = async () => {
  const data = {
    description: "PerfectPan's Blog",
    icon: '/images/favicon.png',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
