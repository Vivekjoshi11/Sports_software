/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { registerPlayer } from '@/lib/registerPlayer';

const playerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['Boys', 'Girls']),
  ageCategory: z.enum(['U-14', 'U-19', 'Open']),
  weightClass: z.string().optional(),
  belt: z.enum(['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Black']).optional(),
});

type PlayerForm = z.infer<typeof playerSchema>;

interface ParsedPlayer {
  name: string;
  gender: string;
  ageCategory: string;
  weightClass?: string;
  belt?: string;
}

export default function RegisterPlayerPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [registerMode, setRegisterMode] = useState<'single' | 'csv'>('single');
  const [csvData, setCsvData] = useState<ParsedPlayer[]>([]);
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PlayerForm>({
    resolver: zodResolver(playerSchema),
  });

  const onSubmit = async (data: PlayerForm) => {
    startTransition(async () => {
      const result = await registerPlayer({ ...data, tournamentId });
      if (result.success) {
        alert('Player registered successfully!');
        reset();
      } else {
        alert(result.error);
      }
    });
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setCsvError('CSV file must have a header row and at least one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'gender', 'agecategory'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setCsvError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        const nameIdx = headers.indexOf('name');
        const genderIdx = headers.indexOf('gender');
        const ageIdx = headers.indexOf('agecategory');
        const weightIdx = headers.indexOf('weightclass');
        const beltIdx = headers.indexOf('belt');

        const players: ParsedPlayer[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < 3 || !values[nameIdx]) continue;

          const gender = values[genderIdx]?.toLowerCase();
          const ageCategory = values[ageIdx]?.toLowerCase();
          
          if (!['boys', 'girls'].includes(gender)) {
            setCsvError(`Invalid gender at row ${i + 1}: "${values[genderIdx]}". Use "Boys" or "Girls"`);
            return;
          }
          
          if (!['u-14', 'u-19', 'open'].includes(ageCategory)) {
            setCsvError(`Invalid age category at row ${i + 1}: "${values[ageIdx]}". Use "U-14", "U-19", or "Open"`);
            return;
          }

          players.push({
            name: values[nameIdx],
            gender: gender.charAt(0).toUpperCase() + gender.slice(1),
            ageCategory: ageCategory.toUpperCase(),
            weightClass: weightIdx >= 0 ? values[weightIdx] || undefined : undefined,
            belt: beltIdx >= 0 ? values[beltIdx] || undefined : undefined,
          });
        }

        if (players.length === 0) {
          setCsvError('No valid players found in CSV');
          return;
        }

        setCsvData(players);
        setCsvError('');
        setCsvSuccess(`Found ${players.length} players. Click "Register All" to register them.`);
      } catch (err) {
        setCsvError('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  };

  const registerAllPlayers = async () => {
    if (csvData.length === 0) return;
    
    startTransition(async () => {
      let successCount = 0;
      let failCount = 0;

      for (const player of csvData) {
        const result = await registerPlayer({ ...player, tournamentId });
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (failCount === 0) {
        alert(`Successfully registered ${successCount} players!`);
        setCsvData([]);
        setCsvSuccess('');
        setRegisterMode('single');
        // Redirect to bracket page
        window.location.href = `/tournaments/${tournamentId}/bracket`;
      } else {
        alert(`Registered ${successCount} players. ${failCount} failed.`);
        // Still redirect to bracket
        window.location.href = `/tournaments/${tournamentId}/bracket`;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register Player</h1>
        
        <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setRegisterMode('single')}
            className={`flex-1 py-2 px-4 rounded-md transition ${registerMode === 'single' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
          >
            Single Player
          </button>
          <button
            type="button"
            onClick={() => setRegisterMode('csv')}
            className={`flex-1 py-2 px-4 rounded-md transition ${registerMode === 'csv' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
          >
            Multiple (CSV)
          </button>
        </div>

        {registerMode === 'single' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Player Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Enter player name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium mb-1">
              Gender
            </label>
            <select
              id="gender"
              {...register('gender')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="">Select gender</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="ageCategory" className="block text-sm font-medium mb-1">
              Age Category
            </label>
            <select
              id="ageCategory"
              {...register('ageCategory')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="">Select age category</option>
              <option value="U-14">U-14</option>
              <option value="U-19">U-19</option>
              <option value="Open">Open</option>
            </select>
            {errors.ageCategory && (
              <p className="text-red-500 text-sm mt-1">{errors.ageCategory.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="weightClass" className="block text-sm font-medium mb-1">
              Weight Class (Optional)
            </label>
            <input
              id="weightClass"
              type="text"
              {...register('weightClass')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="e.g., 50kg"
            />
            {errors.weightClass && (
              <p className="text-red-500 text-sm mt-1">{errors.weightClass.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="belt" className="block text-sm font-medium mb-1">
              Belt (Optional)
            </label>
            <select
              id="belt"
              {...register('belt')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="">Select belt</option>
              <option value="White">White</option>
              <option value="Yellow">Yellow</option>
              <option value="Orange">Orange</option>
              <option value="Green">Green</option>
              <option value="Blue">Blue</option>
              <option value="Purple">Purple</option>
              <option value="Brown">Brown</option>
              <option value="Black">Black</option>
            </select>
            {errors.belt && (
              <p className="text-red-500 text-sm mt-1">{errors.belt.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition duration-300"
          >
            {isPending ? 'Registering...' : 'Register Player'}
          </button>
        </form>
        ) : (
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2">CSV Format</h3>
            <p className="text-xs text-gray-400 mb-2">Required columns: name, gender, agecategory</p>
            <p className="text-xs text-gray-400 mb-2">Optional columns: weightclass, belt</p>
            <p className="text-xs text-gray-400">Example:</p>
            <code className="block bg-gray-900 p-2 rounded text-xs mt-1">
              name,gender,agecategory,weightclass,belt<br/>
              John Doe,Boys,U-14,50kg,White<br/>
              Jane Smith,Girls,U-19,45kg,Yellow
            </code>
          </div>

          <div>
            <label htmlFor="csvFile" className="block text-sm font-medium mb-1">
              Upload CSV File
            </label>
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) parseCSV(file);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          {csvError && (
            <p className="text-red-500 text-sm">{csvError}</p>
          )}

          {csvSuccess && (
            <p className="text-green-500 text-sm">{csvSuccess}</p>
          )}

          {csvData.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-lg max-h-60 overflow-y-auto">
              <h3 className="text-sm font-medium mb-2">Players to register ({csvData.length})</h3>
              {csvData.map((player, idx) => (
                <div key={idx} className="text-sm text-gray-300 py-1 border-b border-gray-600">
                  {player.name} - {player.gender} - {player.ageCategory}
                  {player.weightClass && ` - ${player.weightClass}`}
                  {player.belt && ` - ${player.belt}`}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={registerAllPlayers}
            disabled={isPending || csvData.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md transition duration-300"
          >
            {isPending ? 'Registering...' : `Register All ${csvData.length > 0 ? `(${csvData.length})` : ''}`}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}