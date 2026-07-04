import { StatCard } from '../ui/Primitives';
import { STATS } from '../../data/content';

export default function StatsStrip() {
  return (
    <section className="container-app -mt-10 relative z-10 pb-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <StatCard label={s.label} value={s.value} />
          </div>
        ))}
      </div>
    </section>
  );
}
