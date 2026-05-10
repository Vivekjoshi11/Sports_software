'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewTournamentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', sport: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/tournaments/${data.id}`);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to create tournament');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user || !['TOURNAMENT_ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">You need Tournament Admin privileges to create tournaments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Tournament</h1>
          <p className="text-gray-400 mt-2">Set up a new tournament for your combat sports event.</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Tournament Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Spring Taekwondo Championship 2026"
              />
            </div>

            <div>
              <label htmlFor="sport" className="block text-sm font-medium mb-2">
                Sport
              </label>
              <select
                id="sport"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a sport</option>
                <option value="Taekwondo">Taekwondo</option>
                <option value="Karate">Karate</option>
                <option value="Judo">Judo</option>
                <option value="Boxing">Boxing</option>
                <option value="Muay Thai">Muay Thai</option>
                <option value="Brazilian Jiu-Jitsu">Brazilian Jiu-Jitsu</option>
                <option value="Mixed Martial Arts">Mixed Martial Arts</option>
              </select>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}