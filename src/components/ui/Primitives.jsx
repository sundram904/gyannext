export function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''} animate-fade-up`}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-ink-400">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value }) {
  return (
    <div className="glass-card px-6 py-5 text-center">
      <p className="font-display text-2xl font-bold text-gradient sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-ink-400">{label}</p>
    </div>
  );
}

export function GlassCard({ children, className = '' }) {
  return <div className={`glass-card p-6 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary/10 text-primary-700 dark:text-primary-300',
    secondary: 'bg-secondary/10 text-secondary-700 dark:text-secondary-300',
    green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    red: 'bg-red-500/10 text-red-600 dark:text-red-300',
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
