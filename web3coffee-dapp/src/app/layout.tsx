import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ContextProvider from '@/context';
import { Navigation } from '@/components/layout/Navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'Web3 Coffee',
  description: 'Support creators with crypto on Base',
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>
          <Navigation />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}