import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ChapterNav from '@/components/ChapterNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prompt Engineering Schulung',
  description: 'Interaktives Prompt Engineering Tutorial von Anthropic',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.className} bg-white`}>
        <div className="flex min-h-screen">
          <ChapterNav />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
