// src/app/notes/page.tsx
// ... existing code ...
import { supabase } from '@/lib/supabase';
import NoteEditor from '@/components/NoteEditor';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { redirect } from 'next/navigation'; // 変更点1: redirectをインポート

export default async function NotesPage() {
  async function handleNoteSaved() {
    'use server';
    revalidatePath('/notes'); // メモ一覧ページを再検証
    redirect('/notes'); // 変更点2: 保存後、メモ一覧ページへリダイレクト
  }

  const { data: notes, error } = await supabase.from('notes').select('*');

  if (error) {
    console.error('Error fetching notes:', error);
    return <div>メモの読み込み中にエラーが発生しました。</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">メモ一覧</h1>

      {/* 新しいメモを作成するためのNoteEditorコンポーネントを追加 */}
      <div className="mb-8"> {/* 余白のためのdiv */}
        <h2 className="text-xl font-semibold mb-2">新しいメモを作成</h2>
        {/* onNoteSaved プロパティとしてServer Actionを渡す */}
        <NoteEditor onNoteSaved={handleNoteSaved} />
      </div>

      {notes && notes.length > 0 ? (
        <ul>
          {notes.map((note) => (
            <li key={note.id} className="mb-2 p-2 border rounded hover:bg-gray-50">
              <Link href={`/notes/${note.id}`} className="block">
                <h2 className="text-xl font-semibold">{note.title || '無題のメモ'}</h2>
                <div className="text-gray-600 text-sm mt-1 prose prose-sm max-w-none">
                  {note.content ? <ReactMarkdown>{note.content.substring(0, 100) + '...'}</ReactMarkdown> : '内容なし'}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>まだメモがありません。</p>
      )}
    </div>
  );
}