import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-bold text-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-white">Page not found</h1>
      <p className="mt-2 max-w-sm text-ink-400">The page you're looking for doesn't exist or may have been moved.</p>
      <Link to="/" className="btn-primary mt-6"><Home size={16} /> Back to Home</Link>
    </div>
  );
}
