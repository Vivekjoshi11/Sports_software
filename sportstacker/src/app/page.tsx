/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-comment-textnodes */
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 w-full bg-gray-800 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">SportStacker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                Log In
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Manage Tournaments Like a Pro
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Streamline tournament management for Taekwondo and combat sports. Create, organize, and track events effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/tournaments/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 transform hover:scale-105 inline-block">
              Create Tournament
            </Link>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 transform hover:scale-105">
              Browse Events
            </button>
          </div>
        </div>
      </section>

      {/* Supported Sports Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Supported Sports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Taekwondo */}
            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
              <div className="w-full h-48 bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-4xl">🥋</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-white">Taekwondo</h3>
                <p className="text-gray-300">
                  Manage Taekwondo tournaments with precision scoring, bracket systems, and real-time updates.
                </p>
              </div>
            </div>

            {/* Karate */}
            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
              <div className="w-full h-48 bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <span className="text-white text-4xl">🥋</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-white">Karate</h3>
                <p className="text-gray-300">
                  Organize Karate competitions with advanced match scheduling and participant management.
                </p>
              </div>
            </div>

            {/* Judo */}
            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
              <div className="w-full h-48 bg-linear-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <span className="text-white text-4xl">🥋</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-white">Judo</h3>
                <p className="text-gray-300">
                  Handle Judo events with weight class divisions, elimination rounds, and scoring systems.
                </p>
              </div>
            </div>

            {/* Boxing */}
            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
              <div className="w-full h-48 bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-white text-4xl">🥊</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-white">Boxing</h3>
                <p className="text-gray-300">
                  Manage boxing matches with round-based scoring, weight categories, and live tracking.
                </p>
              </div>
            </div>

            {/* More Coming Soon */}
            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105">
              <div className="w-full h-48 bg-linear-to-br from-yellow-500 to-red-500 flex items-center justify-center">
                <span className="text-white text-4xl">🚀</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-white">More Coming Soon</h3>
                <p className="text-gray-300">
                  // eslint-disable-next-line react/no-unescaped-entities
                  We're expanding to support more combat sports. Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">&copy; 2026 SportStacker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
