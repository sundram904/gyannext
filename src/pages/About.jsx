import { Target, Eye, ShieldCheck, Rocket, Users, Award, Sparkles } from 'lucide-react';
import { SectionHeading, GlassCard } from '../components/ui/Primitives';

const whyUs = [
  { icon: Users, title: 'Verified Educators', desc: 'Every teacher is manually vetted and admin-approved before they can teach.' },
  { icon: Rocket, title: 'Live + Recorded', desc: 'Attend live Google Meet classes or catch up anytime with recordings.' },
  { icon: Award, title: 'Real Certificates', desc: 'QR-verified certificates that prove genuine, completed learning.' },
  { icon: ShieldCheck, title: 'Safe & Transparent', desc: 'Parents can track attendance, tests and progress in real time.' },
];

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-radial py-16 sm:py-20">
        <div className="container-app">
          <SectionHeading eyebrow="About GyanNext" title="Education that grows with you" subtitle="We're building the learning platform we wished existed when we were students — one place for school, code and career skills." />
        </div>
      </section>

      <section className="container-app py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <GlassCard>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Target size={22} /></div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink-900 dark:text-white">Our Mission</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              To make high-quality school education, programming skills and career training accessible
              and affordable to every student — regardless of where they live or which board they study under.
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary"><Eye size={22} /></div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink-900 dark:text-white">Our Vision</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              A future where every learner has a personal, verified mentor, a clear progress trail and a
              certificate that genuinely reflects what they know — not just what they paid for.
            </p>
          </GlassCard>
        </div>
      </section>

      <section className="bg-ink-50 dark:bg-white/[0.02] py-16">
        <div className="container-app grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="relative mx-auto max-w-sm">
            <div className="aspect-square overflow-hidden rounded-3xl bg-brand-gradient shadow-glow">
              <img src="https://i.pravatar.cc/400?img=68" alt="Founder" className="h-full w-full object-cover mix-blend-luminosity opacity-90" />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-2xl border border-white/60 dark:border-white/10 bg-white dark:bg-ink-900 px-5 py-3 shadow-card text-center">
              <p className="font-display text-sm font-bold text-ink-900 dark:text-white">Sundram Kumar</p>
              <p className="text-xs text-ink-400">Founder & CEO</p>
            </div>
          </div>
          <div>
            <span className="section-eyebrow"><Sparkles size={14} /> Founder's Note</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
              "I built GyanNext for the student I once was."
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              Growing up, quality coaching and mentorship felt out of reach for most students outside big
              cities. GyanNext started as a small batch of Class 10 students on a shared Google Meet link —
              today it's a full platform combining school learning, programming and career skills, built by
              educators who still teach every week.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              Our promise stays the same as it was on day one: verified teachers, honest progress tracking,
              and certificates that mean something.
            </p>
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <SectionHeading eyebrow="Why GyanNext" title="Why students and parents choose us" />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item) => (
            <div key={item.title} className="card-hover rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <item.icon size={20} />
              </div>
              <h4 className="mt-4 font-display font-semibold text-ink-900 dark:text-white">{item.title}</h4>
              <p className="mt-1.5 text-sm text-ink-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
