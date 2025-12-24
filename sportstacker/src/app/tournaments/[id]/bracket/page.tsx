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
  winner?: Player;
}

// Helper function to generate single-elimination bracket
function generateBracket(players: Player[], winners: { [key: string]: Player }, seed: number) {
  // Shuffle players using seed for consistency
  const shuffled = [...players].sort((a, b) => {
    const hashA = a.name.split('').reduce((h, c) => h * 31 + c.charCodeAt(0), seed);
    const hashB = b.name.split('').reduce((h, c) => h * 31 + c.charCodeAt(0), seed);
    return hashA - hashB;
  });

  // Calculate next power of 2
  const numPlayers = shuffled.length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numPlayers)));

  // Add byes
  const bracket = [...shuffled];
  while (bracket.length < nextPowerOf2) {
    bracket.push({ id: 'bye', name: 'BYE' } as Player);
  }

  // Generate all rounds
  const rounds: Match[][] = [];
  let currentRound = [...bracket];

  while (currentRound.length > 1) {
    const roundMatches: Match[] = [];
    for (let i = 0; i < currentRound.length; i += 2) {
      const matchKey = `round${rounds.length}-match${i / 2}`;
      const winner = winners[matchKey];
      roundMatches.push({
        player1: currentRound[i],
        player2: currentRound[i + 1],
        winner,
      });
    }
    rounds.push(roundMatches);

    // Prepare next round with winners or placeholders
    currentRound = roundMatches.map((match, index) => {
      const matchKey = `round${rounds.length - 1}-match${index}`;
      return winners[matchKey] || ({ id: 'tbd', name: 'TBD' } as Player);
    });
  }

  return rounds;
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
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [winners, setWinners] = useState<{ [key: string]: Player }>({});
  const [bracketKey, setBracketKey] = useState(0);

  useEffect(() => {
    getPlayers(tournamentId).then(setPlayers);
  }, [tournamentId]);

  const groups = useMemo(() => groupPlayers(players), [players]);

  const selectedGroupKeyDisplay = selectedGroupKey || (groups.length > 0 ? groups[0].key : '');

  const selectedGroup = useMemo(() => groups.find(g => g.key === selectedGroupKeyDisplay), [groups, selectedGroupKeyDisplay]);

  const bracket = useMemo(() => selectedGroup ? generateBracket(selectedGroup.players, winners, bracketKey) : [], [selectedGroup, winners, bracketKey]);
  


  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupKey(e.target.value);
  };

  const selectWinner = (roundIndex: number, matchIndex: number, player: Player) => {
    const matchKey = `round${roundIndex}-match${matchIndex}`;
    setWinners(prev => ({ ...prev, [matchKey]: player }));
  };

  const resetMatch = (roundIndex: number, matchIndex: number) => {
    const matchKey = `round${roundIndex}-match${matchIndex}`;
    setWinners(prev => {
      const newWinners = { ...prev };
      delete newWinners[matchKey];
      return newWinners;
    });
  };

  const handleRegenerate = () => {
    if (selectedGroup) {
      setWinners({});
      setBracketKey(prev => prev + 1);
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
          value={selectedGroupKeyDisplay}
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
        <h2 className="text-xl font-semibold mb-4">{selectedGroupKeyDisplay}</h2>
        {bracket.map((round, roundIndex) => (
          <div key={roundIndex} className="mb-8">
            <h3 className="text-lg font-medium mb-4">Round {roundIndex + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {round.map((match, matchIndex) => (
                <div key={matchIndex} className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-center mb-2">Match {matchIndex + 1}</div>
                  {match.winner && (
                    <div className="text-center mb-2">
                      <button
                        onClick={() => resetMatch(roundIndex, matchIndex)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Reset Match
                      </button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className={`p-2 rounded ${match.winner?.id === match.player1.id ? 'bg-green-600' : 'bg-gray-700'}`}>
                      {match.player1.name || 'TBD'}
                      {match.player1.id !== 'bye' && match.player1.id !== 'tbd' && !match.winner && (
                        <button
                          onClick={() => selectWinner(roundIndex, matchIndex, match.player1)}
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                        >
                          Winner
                        </button>
                      )}
                      {match.winner && match.winner.id === match.player1.id && (
                        <span className="ml-2 text-yellow-300 font-bold text-xs">WINNER</span>
                      )}
                      {match.winner && match.winner.id !== match.player1.id && (
                        <span className="ml-2 text-red-300 text-xs">Eliminated</span>
                      )}
                    </div>
                    <div className="text-center">vs</div>
                    <div className={`p-2 rounded ${match.winner?.id === match.player2?.id ? 'bg-green-600' : 'bg-gray-700'}`}>
                      {match.player2?.name || 'TBD'}
                      {match.player2 && match.player2.id !== 'bye' && match.player2.id !== 'tbd' && !match.winner && (
                        <button
                          onClick={() => selectWinner(roundIndex, matchIndex, match.player2)}
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                        >
                          Winner
                        </button>
                      )}
                      {match.winner && match.winner.id === match.player2?.id && (
                        <span className="ml-2 text-yellow-300 font-bold text-xs">WINNER</span>
                      )}
                      {match.winner && match.winner.id !== match.player2?.id && (
                        <span className="ml-2 text-red-300 text-xs">Eliminated</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}