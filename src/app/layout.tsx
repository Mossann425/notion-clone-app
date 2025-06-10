import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import Sidebar from '@/components/Sidebar'; // 変更点1: Sidebarのインポートは不要になる
import LayoutWrapper from '@/components/LayoutWrapper'; // 変更点2: LayoutWrapperをインポート

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Notion Clone',
  description: 'A simple note-taking application inspired by Notion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* 変更点3: LayoutWrapperでchildrenを囲む */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}