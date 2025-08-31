import { getTweets } from '@/lib/tweets';
import PostForm from '@/components/PostForm';

export default async function CouplePage({
  params,
}: {
  params: { slug: string };
}) {
  const tweets = await getTweets(params.slug);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">
        💌 {params.slug}'s Love Feed
      </h1>
      <PostForm coupleId={params.slug} />
      {/* Rest of your component */}
    </div>
  );
}
