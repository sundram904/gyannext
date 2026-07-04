import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '../ui/Primitives';

export default function TrackShowcase({ eyebrow, title, subtitle, items, category, reverse = false, accent = 'primary' }) {
  const accentBg = accent === 'primary' ? 'bg-primary/10 text-primary-700 dark:text-primary-300' : 'bg-secondary/10 text-secondary-700 dark:text-secondary-300';

  return (
    <section className="container-app py-16 sm:py-20">
      <div className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} center={false} />
          <Link to={`/courses?category=${category}`} className="btn-primary mt-7 text-sm">
            Browse all {title.split(' ')[0]} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 px-3.5 py-3 text-sm font-medium text-ink-700 dark:text-ink-100 card-hover animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${accentBg}`}>
                <CheckCircle2 size={14} />
              </span>
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
