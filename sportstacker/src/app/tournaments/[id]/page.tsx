import Link from 'next/link';

interface TournamentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Tournament Details</h1>
        <p className="mb-4">Tournament ID: {id}</p>
        <div className="space-y-4">
          <Link
            href={`/tournaments/${id}/register`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition duration-300 inline-block w-full"
          >
            Register Player
          </Link>
          <Link
            href={`/tournaments/${id}/bracket`}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition duration-300 inline-block w-full"
          >
            View Bracket
          </Link>
        </div>
      </div>
    </div>
  );
}