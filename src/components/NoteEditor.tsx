import { useState } from 'react'; // useEffectは削除されました
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/types'; // Note型をインポート
import { saveNote, deleteNote } from '@/app/notes/actions';

type Props = {
  initialNote?: Note;
  onNoteSaved: (note: Note) => void;
  onNoteDeleted?: () => void; // この行がオプションになっていることを確認してください
};

export default function NoteEditor({ initialNote, onNoteSaved, onNoteDeleted }: Props) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    const id = initialNote?.id;
    const { data, error } = await saveNote({ id, title, content });

    if (error) {
      console.error('Error saving note:', error.message);
    } else if (data) {
      onNoteSaved(data); // dataはNote型として渡されます
      if (!initialNote?.id) {
        router.push(`/notes/${data.id}`);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!initialNote?.id) return;

    if (window.confirm('このメモを削除してもよろしいですか？')) {
      const { error } = await deleteNote(initialNote.id);
      if (error) {
        console.error('Error deleting note:', error.message);
      } else {
        // onNoteDeleted が存在する場合のみ呼び出す
        if (onNoteDeleted) {
          onNoteDeleted();
        } else {
          router.push('/notes');
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <input
        type="text"
        placeholder="タイトル"
        className="w-full p-2 mb-4 text-xl font-bold bg-transparent border-b border-gray-700 focus:outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="メモの内容"
        className="flex-grow w-full p-2 bg-transparent focus:outline-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
        {initialNote && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}