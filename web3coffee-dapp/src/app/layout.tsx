import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ContextProvider from '@/context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Web3 Coffee',
  description: 'Support creators with USDC',
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
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}