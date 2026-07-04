import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white shadow-glow transition-transform duration-300 group-hover:scale-105">
        G
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-secondary-300 ring-2 ring-white dark:ring-ink-950" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-ink-900 dark:text-white">
        Gyan<span className="text-gradient">Next</span>
      </span>
    </Link>
  );
}
