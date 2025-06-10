'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Note } from '@/lib/types';

type SaveNoteParams = {
  id?: string;
  title: string | null;
  content: string | null;
};

export async function saveNote({ id, title, content }: SaveNoteParams) {
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
    return { data, error: null };
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
    return { data, error: null };
  }
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id);

  if (error) {
    return { error };
  }
  revalidatePath('/notes');
  revalidatePath(`/notes/${id}`);
  redirect('/notes');
}