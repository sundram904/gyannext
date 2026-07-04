import { SectionHeading } from '../ui/Primitives';
import FaqAccordion from '../ui/FaqAccordion';
import { FAQS } from '../../data/content';

export default function FaqSection() {
  return (
    <section className="container-app py-16 sm:py-20">
      <SectionHeading eyebrow="FAQ" title="Frequently asked questions" subtitle="Can't find what you're looking for? Reach out on the contact page." />
      <div className="mt-12">
        <FaqAccordion items={FAQS} />
      </div>
    </section>
  );
}
