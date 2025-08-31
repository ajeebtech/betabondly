import { getTweets } from '@/lib/tweets';
import PostForm from '@/components/PostForm';

interface CouplePageProps {
  params: { slug: string };
}

export default async function CouplePage({ params }: CouplePageProps) {
  const tweets = await getTweets(params.slug);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">
        💌 {params.slug}'s Love Feed
      </h1>

      {/* Post form */}
      <PostForm coupleId={params.slug} />

      {tweets.length === 0 ? (
        <p className="text-gray-500 italic">No posts yet — start sharing!</p>
      ) : (
        <div className="space-y-6">
          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
            >
              {tweet.media_url && (
                tweet.media_url.match(/\.(mp4|webm)$/i) ? (
                  <video
                    src={tweet.media_url}
                    controls
                    className="rounded-lg mb-3 w-full"
                  />
                ) : (
                  <img
                    src={tweet.media_url}
                    alt="Couple post"
                    className="rounded-lg mb-3 w-full"
                  />
                )
              )}
              <p className="text-gray-800">{tweet.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(tweet.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
