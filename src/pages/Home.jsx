import Hero from '../components/home/Hero';
import StatsStrip from '../components/home/StatsStrip';
import Categories from '../components/home/Categories';
import FeaturedCourses from '../components/home/FeaturedCourses';
import TrackShowcase from '../components/home/TrackShowcase';
import Testimonials from '../components/home/Testimonials';
import FaqSection from '../components/home/FaqSection';
import ContactTeaser from '../components/home/ContactTeaser';

const schoolItems = ['Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'CBSE Board', 'Bihar Board'];
const programmingItems = ['C', 'C++', 'Java', 'Python', 'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'DSA'];

export default function Home() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <Categories />
      <FeaturedCourses />
      <TrackShowcase
        eyebrow="School Learning"
        title="Board-ready school courses, Class 3 to 10"
        subtitle="Structured, syllabus-aligned learning with live doubt sessions for CBSE and Bihar Board students."
        items={schoolItems}
        category="school"
        accent="primary"
      />
      <TrackShowcase
        eyebrow="Programming"
        title="Build real skills with programming courses"
        subtitle="From your first line of code to Data Structures, Cyber Security and AI — project-based and beginner friendly."
        items={programmingItems}
        category="programming"
        accent="secondary"
        reverse
      />
      <Testimonials />
      <FaqSection />
      <ContactTeaser />
    </>
  );
}
