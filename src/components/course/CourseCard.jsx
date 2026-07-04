import { Link } from 'react-router-dom';
import { Star, Users, Layers, Clock } from 'lucide-react';

const CATEGORY_STYLE = {
  school: 'bg-primary/10 text-primary-700 dark:text-primary-300',
  programming: 'bg-secondary/10 text-secondary-700 dark:text-secondary-300',
  skill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

const CATEGORY_LABEL = { school: 'School', programming: 'Programming', skill: 'Skill' };

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40"
    >
      <div className="relative flex h-32 items-center justify-center bg-brand-gradient overflow-hidden">
        <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -right-4 -bottom-8 h-20 w-20 rounded-full bg-white/10" />
        <span className="font-display text-3xl font-bold text-white/90">
          {course.title.charAt(0)}
        </span>
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${CATEGORY_STYLE[course.category]}`}>
          {CATEGORY_LABEL[course.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold text-ink-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-ink-400 line-clamp-1">{course.subtitle}</p>

        <div className="mt-3 flex items-center gap-3 text-xs text-ink-400">
          <span className="flex items-center gap-1"><Layers size={13} /> {course.chapters} ch</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {course.duration}</span>
          <span className="flex items-center gap-1"><Users size={13} /> {course.students}+</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-white/10 pt-3">
          <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
            <Star size={14} className="fill-amber-400 text-amber-400" /> {course.rating.toFixed(1)}
          </span>
          <span className="font-display text-lg font-bold text-ink-900 dark:text-white">₹{course.price}</span>
        </div>
      </div>
    </Link>
  );
}
