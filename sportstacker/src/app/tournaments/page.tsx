/* eslint-disable @typescript-eslint/no-unused-vars */


'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

interface Tournament {
  id: string;
  name: string;
  sport: string;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const res = await fetch('/api/tournaments');
        const data = await res.json();
        setTournaments(data);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };
    void loadTournaments();
  }, []);

  const deleteTournament = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTournaments(tournaments.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <Link
            href="/tournaments/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Create New Tournament
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tournaments found.</p>
            <Link
              href="/tournaments/new"
              className="text-blue-400 hover:text-blue-300 mt-4 inline-block"
            >
              Create your first tournament
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament: Tournament) => (
              <div
                key={tournament.id}
                className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300"
              >
                <h2 className="text-xl font-semibold mb-2">{tournament.name}</h2>
                <p className="text-gray-400 mb-4">{tournament.sport}</p>
                <div className="flex space-x-2">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-300"
                  >
                    View
                  </Link>
                  <Link
                    href={`/tournaments/${tournament.id}/register`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-300"
                  >
                    Register
                  </Link>
                  <Link
                    href={`/tournaments/${tournament.id}/bracket`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition duration-300"
                  >
                    Bracket
                  </Link>
                  <button
                    onClick={() => deleteTournament(tournament.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}