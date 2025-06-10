// src/components/NoteEditor.tsx
'use client'; // クライアントコンポーネントであることを宣言

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
// import { useRouter } from 'next/navigation'; // Server Actionがリダイレクトを処理するため、このインポートは不要になりました

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string | null;
    content: string | null;
  };
  onNoteSaved?: () => void;
  onNoteDeleted?: () => void; // onNoteDeleted プロパティの型定義を追加
}

export default function NoteEditor({ initialNote, onNoteSaved, onNoteDeleted }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const noteId = useRef(initialNote?.id);
  // const router = useRouter(); // useRouterフックはServer Actionがリダイレクトを処理するため不要になりました

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('保存中...');

    try {
      if (noteId.current) {
        // 既存のメモを更新
        const { data, error } = await supabase
          .from('notes')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('id', noteId.current)
          .select();

        if (error) throw error;
        console.log('メモを更新しました:', data);
        setSaveStatus('保存されました！');
      } else {
        // 新しいメモを作成
        const { data, error } = await supabase
          .from('notes')
          .insert([{ title, content }])
          .select();

        if (error) throw error;
        noteId.current = data[0].id;
        console.log('新しいメモを作成しました:', data);
        setSaveStatus('保存されました！');
      }
      onNoteSaved?.();
    } catch (error: any) { // error の型を any にして、プロパティにアクセスしやすくする
      console.error('保存エラー:', error, error.message, error.details, error.hint, error.code);
      setSaveStatus('保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId.current || !window.confirm('本当にこのメモを削除しますか？')) {
      return; // IDがない場合、またはユーザーがキャンセルした場合は処理を中止
    }

    setIsDeleting(true);
    setSaveStatus('削除中...');

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId.current);

      if (error) throw error;

      console.log('メモを削除しました:', noteId.current);
      setSaveStatus('メモが削除されました。');
      onNoteDeleted?.(); // 削除成功後に onNoteDeleted コールバックを呼び出す (Server Actionをトリガー)
      // router.push('/notes'); // この行はServer Actionが処理するため不要になりました
    } catch (error: any) { // error の型を any にして、プロパティにアクセスしやすくする
      console.error('削除エラー:', error, error.message, error.details, error.hint, error.code);
      setSaveStatus('削除に失敗しました。');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <input
        type="text"
        className="w-full text-3xl font-bold mb-4 p-2 border-b-2 border-gray-200 focus:outline-none"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full h-64 text-lg p-2 border-none focus:outline-none resize-none"
        placeholder="メモの内容をここに記述..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
          {initialNote?.id && ( // 既存のメモの場合のみ削除ボタンを表示
            <button
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isDeleting ? '削除中...' : '削除'}
            </button>
          )}
        </div>
        <div className="text-gray-500 text-sm">
          {saveStatus}
        </div>
      </div>
    </div>
  );
}