import { Link } from 'react-router-dom';
import { GraduationCap, Code2, Sparkles, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '../ui/Primitives';

const ICONS = { GraduationCap, Code2, Sparkles };

const items = [
  { id: 'school', icon: 'GraduationCap', label: 'School Learning', desc: 'Class 3 to Class 10, CBSE & Bihar Board', count: '8 classes' },
  { id: 'programming', icon: 'Code2', label: 'Programming Courses', desc: 'From C to AI Basics, project-based', count: '16 courses' },
  { id: 'skill', icon: 'Sparkles', label: 'Skill Development', desc: 'Spoken English, MS Office, Interview Prep', count: '5 tracks' },
];

export default function Categories() {
  return (
    <section className="container-app py-16 sm:py-20">
      <SectionHeading eyebrow="Explore" title="Everything you need to learn, in one place" subtitle="Pick a track and start learning at your own pace, or join a live batch." />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.id}
              to={`/courses?category=${item.id}`}
              className="card-hover group relative overflow-hidden rounded-3xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-7 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink-900 dark:text-white">{item.label}</h3>
              <p className="mt-1.5 text-sm text-ink-400">{item.desc}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">{item.count}</span>
                <ArrowUpRight size={18} className="text-ink-300 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
