'use client'; // クライアントコンポーネントであることを宣言

import React from 'react';
import { usePathname } from 'next/navigation'; // usePathnameをインポート
import Sidebar from './Sidebar'; // Sidebarコンポーネントをインポート

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname(); // 現在のパス名を取得

  // パス名からメモのIDを抽出
  // 例: /notes/abcdef-1234-... から "abcdef-1234-..." を取得
  const selectedNoteId = pathname.startsWith('/notes/')
    ? pathname.split('/')[2] // '/notes/ID' の場合、IDは3番目の要素
    : undefined; // それ以外の場合は undefined

  return (
    <div className="flex h-screen">
      {/* selectedNoteId を Sidebar に渡す */}
      <Sidebar selectedNoteId={selectedNoteId} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}