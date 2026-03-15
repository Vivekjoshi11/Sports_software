/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable react-hooks/set-state-in-effect */
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

interface Medalist {
  player: Player;
  medal: 'gold' | 'silver' | 'bronze';
}

// Helper function to generate single-elimination bracket
function generateBracket(players: Player[], winners: { [key: string]: Player }, seed: number) {
  // Shuffle players using seed for consistency
  const shuffled = [...players].sort((a, b) => {
    const hashA = a.name.split('').reduce((h, c) => h * 31 + c.charCodeAt(0), seed);
    const hashB = b.name.split('').reduce((h, c) => h * 31 + c.charCodeAt(0), seed);
    return hashA - hashB;
  });

  const numPlayers = shuffled.length;

  // Handle single player case
  if (numPlayers === 1) {
    // Single player - show as automatic winner
    return [[{
      player1: shuffled[0],
      player2: { id: 'bye', name: 'BYE' } as Player,
      winner: shuffled[0], // Auto-win when only one player
    }]];
  }

  // Calculate next power of 2
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

// Function to get medalists
function getMedalists(bracket: Match[][], winners: { [key: string]: Player }): Medalist[] {
  if (bracket.length === 0) return [];

  const lastRound = bracket[bracket.length - 1];
  if (lastRound.length !== 1 || !lastRound[0].winner) return [];

  const finalMatch = lastRound[0];
  const winner = finalMatch.winner!;
  const finalist = finalMatch.player1.id === winner.id ? finalMatch.player2 : finalMatch.player1;

  const medalists: Medalist[] = [
    { player: winner, medal: 'gold' },
    { player: finalist, medal: 'silver' },
  ];

  // Find bronze medalists: opponents in previous round
  const prevRoundIndex = bracket.length - 2;
  if (prevRoundIndex >= 0) {
    const prevRound = bracket[prevRoundIndex];

    // Opponent for winner
    for (let i = 0; i < prevRound.length; i++) {
      const match = prevRound[i];
      if (match.winner && match.winner.id === winner.id) {
        const opponent = match.player1.id === winner.id ? match.player2 : match.player1;
        if (opponent.id !== 'bye' && opponent.id !== 'tbd') {
          medalists.push({ player: opponent, medal: 'bronze' });
        }
        break;
      }
    }

    // Opponent for finalist
    for (let i = 0; i < prevRound.length; i++) {
      const match = prevRound[i];
      if (match.winner && match.winner.id === finalist.id) {
        const opponent = match.player1.id === finalist.id ? match.player2 : match.player1;
        if (opponent.id !== 'bye' && opponent.id !== 'tbd') {
          medalists.push({ player: opponent, medal: 'bronze' });
        }
        break;
      }
    }
  }

  return medalists;
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

  // Auto-refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      getPlayers(tournamentId).then(setPlayers);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [tournamentId]);

  const groups = useMemo(() => groupPlayers(players), [players]);

  const selectedGroupKeyDisplay = selectedGroupKey || (groups.length > 0 ? groups[0].key : '');

  const selectedGroup = useMemo(() => groups.find(g => g.key === selectedGroupKeyDisplay), [groups, selectedGroupKeyDisplay]);

  const bracket = useMemo(() => selectedGroup ? generateBracket(selectedGroup.players, winners, bracketKey) : [], [selectedGroup, winners, bracketKey]);

  const medalists = useMemo(() => getMedalists(bracket, winners), [bracket, winners]);

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
        setIsFinalized(false);
        // Save regenerated state to sessionStorage
        try {
          const regeneratedData = {
            winners: {},
            isFinalized: false,
            regeneratedAt: new Date().getTime()
          };
          sessionStorage.setItem(
            `bracket_regenerated_${tournamentId}_${selectedGroupKeyDisplay}`,
            JSON.stringify(regeneratedData)
          );
        } catch (sessionStorageError) {
          console.warn('Failed to save regenerated bracket state to sessionStorage:', sessionStorageError);
          // Continue anyway - the state is still updated locally
        }
      }
    };

  const exportToJSON = () => {
    const data = {
      tournamentId,
      group: selectedGroupKeyDisplay,
      players: selectedGroup?.players,
      winners,
      medalists,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament-${tournamentId}-results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportResults = () => {
    // Create HTML content for PDF
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tournament Results</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          .medalists { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .medal { display: flex; align-items: center; margin: 10px 0; font-size: 18px; }
          .medal-icon { font-size: 24px; margin-right: 10px; }
          .gold { color: #FFD700; }
          .silver { color: #C0C0C0; }
          .bronze { color: #CD7F32; }
          .matches { margin-top: 20px; }
          .round { margin-bottom: 20px; }
          .round-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
          .match { padding: 8px; margin: 5px 0; background: #eee; border-radius: 4px; }
          .winner { font-weight: bold; color: green; }
        </style>
      </head>
      <body>
        <h1>Tournament Bracket Results</h1>
    `;
    
    // Medalists
    if (medalists.length > 0) {
      html += `<div class="medalists"><h2>Medalists</h2>`;
      medalists.forEach(m => {
        const medalClass = m.medal;
        const medalEmoji = m.medal === 'gold' ? '🥇' : m.medal === 'silver' ? '🥈' : '🥉';
        html += `<div class="medal ${medalClass}"><span class="medal-icon">${medalEmoji}</span><strong>${m.medal.toUpperCase()}:</strong> ${m.player.name}</div>`;
      });
      html += `</div>`;
    }
    
    // Matches
    html += `<div class="matches"><h2>Match Results</h2>`;
    bracket.forEach((round, roundIndex) => {
      html += `<div class="round"><div class="round-title">Round ${roundIndex + 1}</div>`;
      round.forEach((match, matchIndex) => {
        if (match.player1.id === 'bye' || match.player2?.id === 'bye') {
          html += `<div class="match">Match ${matchIndex + 1}: ${match.player1.name} - BYE</div>`;
        } else if (match.winner) {
          const loser = match.winner.id === match.player1.id ? match.player2?.name : match.player1.name;
          html += `<div class="match">Match ${matchIndex + 1}: ${match.player1.name} vs ${match.player2?.name || 'TBD'}, <span class="winner">Winner: ${match.winner.name}</span></div>`;
        } else {
          html += `<div class="match">Match ${matchIndex + 1}: ${match.player1.name} vs ${match.player2?.name || 'TBD'} - Not Played</div>`;
        }
      });
      html += `</div>`;
    });
    html += `</div></body></html>`;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const printBracket = () => {
    window.print();
  };

  const [isFinalized, setIsFinalized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

   // Load saved bracket on mount
    useEffect(() => {
      async function loadSavedBracket() {
        try {
          // Check if there's a regenerated state in sessionStorage
          const regeneratedKey = `bracket_regenerated_${tournamentId}_${selectedGroupKeyDisplay}`;
          const regeneratedData = sessionStorage.getItem(regeneratedKey);
          
          if (regeneratedData) {
            const parsed = JSON.parse(regeneratedData);
            setWinners(parsed.winners);
            setIsFinalized(parsed.isFinalized);
            // Clear the regenerated flag after loading
            sessionStorage.removeItem(regeneratedKey);
            return;
          }
          
          const res = await fetch(`/api/tournaments/${tournamentId}/bracket?group=${encodeURIComponent(selectedGroupKeyDisplay)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
              const saved = data[0];
              if (saved.winners) {
                setWinners(saved.winners as { [key: string]: Player });
              } else {
                // No winners saved, reset to empty
                setWinners({});
              }
              setIsFinalized(saved.isFinalized);
            } else {
              // No saved data for this group, reset to default state
              setWinners({});
              setIsFinalized(false);
            }
          }
        } catch (err) {
          console.error('Error loading saved bracket:', err);
          // On error, reset to default state
          setWinners({});
          setIsFinalized(false);
        }
      }
      loadSavedBracket();
    }, [tournamentId, selectedGroupKeyDisplay]);

   const saveBracket = async () => {
     setIsSaving(true);
     try {
       const res = await fetch(`/api/tournaments/${tournamentId}/bracket`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           groupKey: selectedGroupKeyDisplay,
           winners,
           isFinalized: true,
         }),
       });
       if (res.ok) {
         setIsFinalized(true);
         alert('Bracket saved successfully!');
       } else {
         alert('Failed to save bracket');
       }
     } catch (err) {
       console.error('Error saving bracket:', err);
       alert('Error saving bracket');
     }
     setIsSaving(false);
   };

    const unsaveBracket = async () => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}/bracket?group=${encodeURIComponent(selectedGroupKeyDisplay)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          // Keep current winners but mark as unsaved
          setIsFinalized(false);
          alert('Bracket unsaved successfully!');
        } else {
          alert('Failed to unsave bracket');
        }
      } catch (err) {
        console.error('Error unsaving bracket:', err);
        alert('Error unsaving bracket');
      }
      setIsSaving(false);
    };

  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Tournament Bracket</h1>
        <div className="text-gray-400">Loading players...</div>
        <div className="mt-4 text-sm text-gray-500">Tournament ID: {tournamentId}</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Tournament Bracket</h1>
        <div className="text-gray-400">No players registered yet. Players loaded: {players.length}</div>
      </div>
    );
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

       <div className="mb-8 flex flex-wrap gap-4">
         <button
           onClick={handleRegenerate}
           disabled={!selectedGroup}
           className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${!selectedGroup ? 'opacity-50' : ''}`}
         >
           Regenerate Bracket
         </button>
        <button
          onClick={exportToJSON}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
        >
          Export JSON
        </button>
        <button
          onClick={printBracket}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Print / Save PDF
        </button>
        <button
          onClick={exportResults}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
        >
          Export Results
        </button>
         {!isSaving && !isFinalized && (
           <button
             onClick={saveBracket}
             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
           >
             Save Final Bracket
           </button>
         )}
         {!isSaving && isFinalized && (
           <>
             <button
               onClick={unsaveBracket}
               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
             >
               Unsave Bracket
             </button>
             <span className="bg-green-600 text-white px-4 py-2 rounded-md ml-2">
               ✓ Bracket Saved
             </span>
           </>
         )}
         {isSaving && (
           <button
             disabled
             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
           >
             Saving...
           </button>
         )}
        {medalists.length > 0 && (
          <div className="bg-gray-800 p-3 rounded-lg mt-4 max-w-xs">
            <h3 className="text-sm font-semibold mb-2">Medalists</h3>
            {medalists.map((m, i) => (
              <div key={i} className="flex items-center mb-1 text-sm">
                <span className={`mr-2 ${m.medal === 'gold' ? 'text-yellow-400' : m.medal === 'silver' ? 'text-gray-300' : 'text-amber-600'}`}>
                  {m.medal === 'gold' ? '🥇' : m.medal === 'silver' ? '🥈' : '🥉'}
                </span>
                {m.player.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bracket-container">
        <h2 className="text-xl font-semibold mb-4">{selectedGroupKeyDisplay}</h2>
        {bracket.map((round, roundIndex) => (
          <div key={roundIndex} className="mb-8">
            <h3 className="text-lg font-medium mb-4">Round {roundIndex + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {round.map((match, matchIndex) => {
                // Skip BYE vs BYE and TBD vs TBD matches
                if ((match.player1.id === 'bye' || match.player1.id === 'tbd') &&
                    (!match.player2 || match.player2.id === 'bye' || match.player2.id === 'tbd')) {
                  return null;
                }
                return (
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
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}