'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Tournament {
  id: string;
  name: string;
  sport: string;
}

export default function OfficialsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tournamentId: '',
    groupKeys: [] as string[]
  });
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      if (res.ok) {
        const data = await res.json();
        setTournaments(data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'TOURNAMENT_ADMIN') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers();
      fetchTournaments();
    }
  }, [session]);

  const fetchGroups = async (tournamentId: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/groups`);
      if (res.ok) {
        const data = await res.json();
        setAvailableGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setAvailableGroups([]);
    }
  };

  const createOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/officials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'OFFICIAL' }),
      });
      if (res.ok) {
        setFormData({ name: '', email: '', password: '', tournamentId: '', groupKeys: [] });
        setShowCreateForm(false);
        setAvailableGroups([]);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating official:', error);
    }
  };

  const handleTournamentChange = (tournamentId: string) => {
    setFormData({ ...formData, tournamentId, groupKeys: [] });
    if (tournamentId) {
      fetchGroups(tournamentId);
    } else {
      setAvailableGroups([]);
    }
  };

  const handleGroupToggle = (group: string) => {
    setFormData(prev => ({
      ...prev,
      groupKeys: prev.groupKeys.includes(group)
        ? prev.groupKeys.filter(g => g !== group)
        : [...prev.groupKeys, group]
    }));
  };

  if (!session?.user || !['SUPERADMIN', 'TOURNAMENT_ADMIN'].includes(session.user.role)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Officials</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/tournaments"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Back to Tournaments
            </Link>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              {showCreateForm ? 'Cancel' : 'Create Official'}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Official</h2>
            <form onSubmit={createOfficial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tournament</label>
                <select
                  value={formData.tournamentId}
                  onChange={(e) => handleTournamentChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Tournament</option>
                  {tournaments.map(tournament => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} - {tournament.sport}
                    </option>
                  ))}
                </select>
              </div>
              {availableGroups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Assign Groups</label>
                  <div className="space-y-2">
                    {availableGroups.map(group => (
                      <label key={group} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.groupKeys.includes(group)}
                          onChange={() => handleGroupToggle(group)}
                          className="mr-2"
                        />
                        {group}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Create
              </button>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.filter(user => user.role === 'OFFICIAL').map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}