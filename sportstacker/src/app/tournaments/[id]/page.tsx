'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tournament Details</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/tournaments"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Back to Tournaments
            </Link>
            <Link
              href={`/tournaments/${tournamentId}/register`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Register Players
            </Link>
            <Link
              href={`/tournaments/${tournamentId}/bracket`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Manage Bracket
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400">Tournament ID: {tournamentId}</p>
          <p className="text-gray-400 mt-2">Manage your tournament from here.</p>
        </div>
      </div>
    </div>
  );
}