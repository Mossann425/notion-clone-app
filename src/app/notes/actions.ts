'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Note } from '@/lib/types';
import { PostgrestError } from '@supabase/supabase-js'; // この行を追加

type SaveNoteParams = {
  id?: string;
  title: string | null;
  content: string | null;
};

// saveNote 関数の戻り値の型を明示的に指定します
export async function saveNote({ id, title, content }: SaveNoteParams): Promise<{ data: Note | null; error: PostgrestError | null }> {
  if (id) {
    const { data, error } = await supabase
      .from('notes')
      .update({ title, content })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }
    revalidatePath('/notes');
    revalidatePath(`/notes/${id}`);
    return { data: data as Note, error: null }; // dataをNote型にキャスト
  } else {
    const { data, error } = await supabase
      .from('notes')
      .insert({ title, content })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }
    revalidatePath('/notes');
    return { data: data as Note, error: null }; // dataをNote型にキャスト
  }
}

export async function deleteNote(id: string): Promise<{ error: PostgrestError | null }> { // 戻り値の型を追加
  const { error } = await supabase.from('notes').delete().eq('id', id);

  if (error) {
    return { error };
  }
  revalidatePath('/notes');
  revalidatePath(`/notes/${id}`);
  redirect('/notes');
  // redirectが実行された場合、この行は unreachable ですが、型のために含めます
  return { error: null };
}