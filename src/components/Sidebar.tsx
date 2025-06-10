'use client'; // クライアントコンポーネントであることを宣言

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Folder {
  id: string;
  name: string;
}

interface Note {
  id: string;
  title: string | null;
  folderId: string | null;
}

interface SidebarProps {
  // 現在選択されているメモのIDを受け取るプロパティ（オプション）
  selectedNoteId?: string;
}

export default function Sidebar({ selectedNoteId }: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // フォルダの開閉状態を管理 (ここでは簡易的に全て開いた状態)
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState(''); // 新しいフォルダ名用の状態
  const [isCreatingFolder, setIsCreatingFolder] = useState(false); // フォルダ作成中かどうかの状態

  useEffect(() => {
    const fetchSidebarData = async () => {
      setLoading(true);
      setError(null);
      try {
        // フォルダの取得
        const { data: foldersData, error: foldersError } = await supabase
          .from('folders')
          .select('id, name')
          .order('name', { ascending: true });

        if (foldersError) throw foldersError;
        setFolders(foldersData || []);
        // 全てのフォルダをデフォルトで開く
        setOpenFolders(new Set(foldersData?.map(f => f.id) || []));

        // メモの取得
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('id, title, folderId')
          .order('created_at', { ascending: false });

        if (notesError) throw notesError;
        setNotes(notesData || []);

      } catch (err: any) {
        console.error('サイドバーデータの取得エラー:', err);
        setError(err.message || 'データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();

    // リアルタイムリスナー (オプション: データの変更をリアルタイムで反映する場合)
    // const notesChannel = supabase
    //   .channel('public:notes')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, payload => {
    //     console.log('Change received!', payload);
    //     fetchSidebarData(); // 変更があったら再フェッチ
    //   })
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(notesChannel);
    // };
  }, []); // 初期ロード時にのみ実行

  // フォルダ作成ハンドラ
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return; // 空のフォルダ名は作成しない

    setIsCreatingFolder(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{ name: newFolderName.trim() }])
        .select(); // 挿入されたデータを取得（必要であれば）

      if (error) throw error;

      console.log('フォルダが作成されました:', data);
      setNewFolderName(''); // 入力フィールドをクリア
      // フォルダリストを再フェッチしてUIを更新
      const { data: updatedFoldersData, error: updatedFoldersError } = await supabase
        .from('folders')
        .select('id, name')
        .order('name', { ascending: true });

      if (updatedFoldersError) throw updatedFoldersError;
      setFolders(updatedFoldersData || []);
      // 新しいフォルダもデフォルトで開く
      setOpenFolders(prev => new Set(prev).add(data[0].id));


    } catch (err: any) {
      console.error('フォルダ作成エラー:', err);
      setError(err.message || 'フォルダの作成に失敗しました。');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">ロード中...</div>;
  if (error) return <div className="p-4 text-red-500">エラー: {error}</div>;

  const notesWithoutFolder = notes.filter(note => !note.folderId);
  const getNotesInFolder = (folderId: string) => notes.filter(note => note.folderId === folderId);

  return (
    <div className="w-64 bg-gray-100 h-full p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">メモ</h2>

      {/* 新しいメモの作成リンク */}
      <Link href="/notes" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        新しいメモ
      </Link>

      {/* 新しいフォルダの作成フォーム */}
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-700 mb-2">新しいフォルダ</h3>
        <input
          type="text"
          placeholder="フォルダ名"
          className="w-full p-2 border rounded mb-2"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          disabled={isCreatingFolder}
        />
        <button
          onClick={handleCreateFolder}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={!newFolderName.trim() || isCreatingFolder}
        >
          {isCreatingFolder ? '作成中...' : 'フォルダを作成'}
        </button>
      </div>

      {/* フォルダなしのメモ */}
      {notesWithoutFolder.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-700 mb-2">未分類</h3>
          <ul>
            {notesWithoutFolder.map(note => (
              <li key={note.id} className="mb-1">
                <Link href={`/notes/${note.id}`} className={`block p-2 rounded hover:bg-gray-200 ${selectedNoteId === note.id ? 'bg-gray-200 font-medium' : ''}`}>
                  {note.title || '無題のメモ'}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* フォルダ一覧 */}
      {folders.length > 0 && (
        <div>
          {folders.map(folder => (
            <div key={folder.id} className="mb-2">
              <h3 className="text-md font-semibold text-gray-700 mb-2 cursor-pointer"
                  onClick={() => setOpenFolders(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(folder.id)) {
                      newSet.delete(folder.id);
                    } else {
                      newSet.add(folder.id);
                    }
                    return newSet;
                  })}>
                {/* フォルダ開閉アイコン */}
                <span className="inline-block transition-transform duration-200 transform mr-1">
                  {openFolders.has(folder.id) ? '▼' : '▶'}
                </span>
                {folder.name}
              </h3>
              {openFolders.has(folder.id) && (
                <ul>
                  {getNotesInFolder(folder.id).map(note => (
                    <li key={note.id} className="mb-1 ml-4">
                      <Link href={`/notes/${note.id}`} className={`block p-2 rounded hover:bg-gray-200 ${selectedNoteId === note.id ? 'bg-gray-200 font-medium' : ''}`}>
                        {note.title || '無題のメモ'}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* フォルダもメモもない場合の表示 */}
      {folders.length === 0 && notesWithoutFolder.length === 0 && (
        <p className="text-gray-500 text-sm">まだフォルダもメモもありません。</p>
      )}
    </div>
  );
}