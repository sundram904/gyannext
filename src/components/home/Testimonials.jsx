import { Star, Quote } from 'lucide-react';
import { SectionHeading } from '../ui/Primitives';
import { TESTIMONIALS } from '../../data/content';

export default function Testimonials() {
  return (
    <section className="bg-ink-50 dark:bg-white/[0.02] py-16 sm:py-20">
      <div className="container-app">
        <SectionHeading eyebrow="Testimonials" title="Loved by students and parents alike" subtitle="Real stories from the GyanNext learning community." />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="glass-card flex flex-col p-6 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <Quote size={22} className="text-primary/40" />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600 dark:text-ink-100">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-ink-100 dark:border-white/10 pt-4">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="font-display text-sm font-semibold text-ink-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-ink-400">{t.role}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={13} className={idx < t.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
