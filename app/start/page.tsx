import GameForm from '@/app/components/game-form';
import Link from 'next/link';

export const metadata = {
  title: 'Create New Game - Dungeon Master',
  description: 'Set up a new D&D game with a custom or random setting',
}
export default function NewGamePage() {
  return (
    <div className="flex min-h-screen items-center justify-center  px-4 font-sans ">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary">
            Create a New Game
          </h1>
          <p className="text-lg">
            Set up your D&D adventure with a custom or random setting
          </p>
        </div>

        <div className="rounded-xl  p-8 shadow-lg ">
          <GameForm />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
