/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { registerPlayer } from '@/lib/registerPlayer';

const playerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['Boys', 'Girls']),
  ageCategory: z.enum(['U-14', 'U-19', 'Open']),
  weightClass: z.string().optional(),
  belt: z.enum(['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Black']).optional(),
});

type PlayerForm = z.infer<typeof playerSchema>;

export default function RegisterPlayerPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlayerForm>({
    resolver: zodResolver(playerSchema),
  });

  const onSubmit = async (data: PlayerForm) => {
    startTransition(async () => {
      const result = await registerPlayer({ ...data, tournamentId });
      if (result.success) {
        alert('Player registered successfully!');
        // Optionally redirect or reset form
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register Player</h1>
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
      </div>
    </div>
  );
}