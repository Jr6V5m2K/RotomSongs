import type { Metadata } from 'next';
import './globals.css';
import { defaultMetadata } from '@/lib/metadata';

const basePath = process.env.NODE_ENV === 'production' ? '/RotomSongs' : '';

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="scroll-smooth">
      <head>
        <link rel="icon" href={`${basePath}/favicon.ico`} sizes="any" />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-800 antialiased">
        {children}
      </body>
    </html>
  );
}
