'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PostForm({ coupleId }: { coupleId: string }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content && !file) return;

    setLoading(true);
    let mediaUrl = null;

    // Upload file if provided
    if (file) {
      const filePath = `${coupleId}/${Date.now()}_${file.name}`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('tweets')
        .upload(filePath, file);

      if (storageError) {
        console.error(storageError);
      } else {
        const { data: urlData } = supabase
          .storage
          .from('tweets')
          .getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
      }
    }

    // Insert tweet
    const { error: insertError } = await supabase
      .from('tweets')
      .insert([
        {
          couple_id: coupleId,
          content,
          media_url: mediaUrl,
        },
      ]);

    if (insertError) console.error(insertError);

    setContent('');
    setFile(null);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-white shadow">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something sweet..."
        className="w-full border rounded p-2 mb-3"
        rows={3}
      />
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-3"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
