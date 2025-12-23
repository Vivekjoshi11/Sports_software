'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewTournamentPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sport: 'Taekwondo',
  });
  const [errors, setErrors] = useState<{ name?: string; sport?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { name?: string; sport?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!['Taekwondo', 'Karate', 'Judo', 'Boxing'].includes(formData.sport)) {
      newErrors.sport = 'Please select a valid sport';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsPending(true);
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { id } = await response.json();
        router.push(`/tournaments/${id}`);
      } else {
        const { error } = await response.json();
        alert(error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create tournament');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Tournament</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Tournament Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Enter tournament name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="sport" className="block text-sm font-medium mb-1">
              Sport
            </label>
            <select
              id="sport"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="Taekwondo">Taekwondo</option>
              <option value="Karate">Karate</option>
              <option value="Judo">Judo</option>
              <option value="Boxing">Boxing</option>
            </select>
            {errors.sport && (
              <p className="text-red-500 text-sm mt-1">{errors.sport}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition duration-300"
          >
            {isPending ? 'Creating...' : 'Create Tournament'}
          </button>
        </form>
      </div>
    </div>
  );
}