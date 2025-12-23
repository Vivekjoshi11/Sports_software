/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

interface Player {
  id: string;
  name: string;
  gender: string;
  ageCategory: string;
  weightClass?: string | null;
  belt?: string | null;
}

interface Group {
  key: string;
  players: Player[];
}

interface Match {
  player1: Player;
  player2: Player;
}

// Helper function to generate single-elimination bracket
function generateBracket(players: Player[]) {
  // Shuffle players for blind draw
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  // Calculate next power of 2
  const numPlayers = shuffled.length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numPlayers)));

  // Add byes
  const bracket = [...shuffled];
  while (bracket.length < nextPowerOf2) {
    bracket.push({ id: 'bye', name: 'BYE' } as Player);
  }

  // Generate matches (simplified - just first round)
  const matches = [];
  for (let i = 0; i < bracket.length; i += 2) {
    matches.push({
      player1: bracket[i],
      player2: bracket[i + 1],
    });
  }

  return matches;
}

async function getPlayers(tournamentId: string): Promise<Player[]> {
  const response = await fetch(`/api/tournaments/${tournamentId}/players`);
  if (!response.ok) return [];
  return response.json();
}

function groupPlayers(players: Player[]): Group[] {
  const groups: { [key: string]: Player[] } = {};

  players.forEach(player => {
    const key = `${player.gender}-${player.ageCategory}-${player.weightClass || 'No Weight'}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(player);
  });

  return Object.entries(groups).map(([key, players]) => ({ key, players }));
}

export default function BracketPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>('');
  const [bracket, setBracket] = useState<Match[]>([]);

  useEffect(() => {
    getPlayers(tournamentId).then(setPlayers);
  }, [tournamentId]);

  const groups = useMemo(() => groupPlayers(players), [players]);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupKey) {
      setSelectedGroupKey(groups[0].key);
    }
  }, [groups, selectedGroupKey]);

  useEffect(() => {
    if (selectedGroupKey) {
      const group = groups.find(g => g.key === selectedGroupKey);
      if (group) {
        setBracket(generateBracket(group.players));
      }
    }
  }, [selectedGroupKey, groups]);

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupKey(e.target.value);
  };

  const handleRegenerate = () => {
    if (selectedGroupKey) {
      const group = groups.find(g => g.key === selectedGroupKey);
      if (group) {
        setBracket(generateBracket(group.players));
      }
    }
  };

  if (players.length === 0) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  if (groups.length === 0) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">No players registered yet.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Tournament Bracket</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Select Group:</label>
        <select
          value={selectedGroupKey}
          onChange={handleGroupChange}
          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
        >
          {groups.map(group => (
            <option key={group.key} value={group.key}>
              {group.key} ({group.players.length} players)
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <button
          onClick={handleRegenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Regenerate Bracket
        </button>
      </div>

      <div className="bracket-container">
        <h2 className="text-xl font-semibold mb-4">{selectedGroupKey}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bracket.map((match, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <div className="text-center mb-2">Match {index + 1}</div>
              <div className="space-y-2">
                <div className="bg-gray-700 p-2 rounded">
                  {match.player1.name || 'TBD'}
                </div>
                <div className="text-center">vs</div>
                <div className="bg-gray-700 p-2 rounded">
                  {match.player2.name || 'TBD'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}