import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlayCircle, ShieldCheck, Users2, Award } from 'lucide-react';

export default function Hero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden bg-brand-radial">
      <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-blob" />
      <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-secondary/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />

      <div className="container-app relative grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="section-eyebrow">
            <ShieldCheck size={14} /> Trusted by 48,000+ learners
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-ink-900 dark:text-white sm:text-5xl lg:text-[3.4rem]">
            Learn without limits.
            <span className="block text-gradient">Grow beyond the classroom.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-400 sm:text-lg">
            GyanNext brings school learning, programming and career-ready skills
            together — live classes, expert mentors, and certificates that open doors.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex max-w-md items-center gap-2 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/60 p-2 shadow-card">
            <Search size={18} className="ml-2 shrink-0 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for Python, Class 10, Resume Building..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
            />
            <button type="submit" className="btn-primary !py-2.5 !px-5 text-sm shrink-0">Search</button>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-100">
              <Users2 size={18} className="text-primary" /> 210+ verified educators
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-100">
              <Award size={18} className="text-primary" /> Certified courses
            </div>
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="relative mx-auto max-w-md rounded-3xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3 shadow-glass backdrop-blur-xl">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-brand-gradient">
              <PlayCircle size={64} className="text-white/90 drop-shadow-lg" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
            </div>
            <div className="absolute -left-6 top-10 animate-float rounded-2xl border border-white/60 dark:border-white/10 bg-white dark:bg-ink-900 px-4 py-3 shadow-card">
              <p className="font-display text-sm font-bold text-ink-900 dark:text-white">Live Class</p>
              <p className="text-xs text-ink-400">DSA · Batch 4B</p>
            </div>
            <div className="absolute -right-6 bottom-10 animate-float rounded-2xl border border-white/60 dark:border-white/10 bg-white dark:bg-ink-900 px-4 py-3 shadow-card" style={{ animationDelay: '1.5s' }}>
              <p className="font-display text-sm font-bold text-ink-900 dark:text-white">Certificate Issued 🎓</p>
              <p className="text-xs text-ink-400">Python for Beginners</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
