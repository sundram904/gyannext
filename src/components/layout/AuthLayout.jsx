import { Link } from 'react-router-dom';
import { ShieldCheck, Video, Award, BarChart3 } from 'lucide-react';
import Logo from '../ui/Logo';

const perks = [
  { icon: Video, text: 'Live Google Meet classes, joinable in one click' },
  { icon: BarChart3, text: 'Real-time progress & attendance tracking' },
  { icon: Award, text: 'QR-verified certificates on completion' },
  { icon: ShieldCheck, text: 'Admin-verified, trustworthy educators' },
];

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 font-display text-lg font-bold text-white">G</span>
          <span className="font-display text-xl font-bold text-white">GyanNext</span>
        </Link>
        <div className="relative">
          <h2 className="max-w-md font-display text-3xl font-bold leading-tight text-white">
            Learn without limits. Grow beyond the classroom.
          </h2>
          <div className="mt-8 space-y-4">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3 text-white/90">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
                  <p.icon size={16} />
                </span>
                <span className="text-sm">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} GyanNext. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
