import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '../ui/Primitives';
import CourseCard from '../course/CourseCard';
import { FEATURED_COURSES } from '../../data/courses';

export default function FeaturedCourses() {
  return (
    <section className="bg-ink-50 dark:bg-white/[0.02] py-16 sm:py-20">
      <div className="container-app">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <SectionHeading eyebrow="Handpicked" title="Featured Courses" center={false} subtitle="Popular this month across School, Programming and Skill tracks." />
          <Link to="/courses" className="btn-outline shrink-0 text-sm">
            View all courses <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
