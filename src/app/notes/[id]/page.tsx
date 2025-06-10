// src/app/notes/[id]/page.tsx
// ... existing code ...
import { supabase } from '@/lib/supabase';
import NoteEditor from '@/components/NoteEditor';
import { notFound, redirect } from 'next/navigation'; // redirectをインポート
import { revalidatePath } from 'next/cache';

interface NoteDetailPageProps {
  params: {
    id: string;
  };
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching note:', error, error.message, error.details, error.hint);
    notFound();
  }

  if (!note) {
    console.log(`メモが見つかりませんでした: ID = ${id}`);
    notFound();
  }

  // Server Action: メモが保存された後にキャッシュを再検証し、一覧に戻る
  async function handleNoteSaved() { // 変更点: リダイレクトを追加
    'use server';
    revalidatePath(`/notes/${id}`); // このメモの詳細ページを再検証 (念のため)
    revalidatePath('/notes'); // メモ一覧ページを再検証
    redirect('/notes'); // 変更点: 編集後、メモ一覧ページへリダイレクト
  }

  // Server Action: メモが削除された後に一覧を再検証し、リダイレクトする
  async function handleNoteDeleted() {
    'use server';
    revalidatePath('/notes'); // メモ一覧ページを再検証
    redirect('/notes'); // 強制的にメモ一覧ページへリダイレクト
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">メモを編集</h1>
      <NoteEditor
        initialNote={note}
        onNoteSaved={handleNoteSaved}
        onNoteDeleted={handleNoteDeleted}
      />
      {/* ... プレビューセクション ... */}
    </div>
  );
}