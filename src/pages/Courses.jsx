import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import CourseCard from '../components/course/CourseCard';
import { ALL_COURSES, CATEGORIES } from '../data/courses';

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const activeCategory = params.get('category') || 'all';

  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);

  const setCategory = (cat) => {
    const next = new URLSearchParams(params);
    if (cat === 'all') next.delete('category');
    else next.set('category', cat);
    setParams(next);
  };

  const filtered = useMemo(() => {
    return ALL_COURSES.filter((c) => {
      const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
      const matchesQuery =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.instructor.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className="container-app py-12">
      <div className="max-w-2xl">
        <span className="section-eyebrow"><SlidersHorizontal size={14} /> Course Catalog</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">
          {filtered.length} courses to help you grow
        </h1>
        <p className="mt-2 text-ink-400">Filter by track, or search by course name and instructor.</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === 'all' ? 'bg-brand-gradient text-white shadow-glow' : 'bg-ink-50 dark:bg-white/5 text-ink-600 dark:text-ink-100 hover:bg-ink-100 dark:hover:bg-white/10'
            }`}
          >
            All Courses
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.id ? 'bg-brand-gradient text-white shadow-glow' : 'bg-ink-50 dark:bg-white/5 text-ink-600 dark:text-ink-100 hover:bg-ink-100 dark:hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 px-3 py-2.5 sm:w-72">
          <Search size={16} className="text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center text-ink-400">
          No courses matched your search. Try a different keyword or filter.
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
