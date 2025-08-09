// src/app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-16 bg-gradient-to-b from-pink-100 to-white">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Welcome to <span className="text-pink-500">Bondly</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          The modern way for couples to stay connected, share moments, and
          create memories together.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-pink-500 text-white rounded-lg text-lg hover:bg-pink-600 transition"
        >
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why You’ll Love It
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-2 text-pink-500">
                Share Moments
              </h3>
              <p className="text-gray-600">
                Post your favorite memories and milestones with your partner in
                one private space.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-2 text-pink-500">
                Stay Connected
              </h3>
              <p className="text-gray-600">
                Real-time updates so you’re always in sync no matter where you
                are.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-2 text-pink-500">
                Build Memories
              </h3>
              <p className="text-gray-600">
                A timeline of your shared life, beautifully organized and easy
                to revisit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pink-500 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Start Your Journey?
        </h2>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-white text-pink-500 rounded-lg text-lg hover:bg-gray-100 transition"
        >
          Join Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm bg-gray-50">
        © {new Date().getFullYear()} Bondly. All rights reserved.
      </footer>
    </main>
  );
}
