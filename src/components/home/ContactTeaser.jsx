import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function ContactTeaser() {
  return (
    <section className="container-app py-16 sm:py-20">
      <div className="overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center sm:px-14">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Still have questions?</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Our team typically replies within a few hours — reach out and we'll help you pick the right course or batch.
        </p>
        <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-4 text-white">
          <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm"><Mail size={15} /> support@gyannext.com</span>
          <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm"><Phone size={15} /> +91 98765 43210</span>
          <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm"><MapPin size={15} /> Patna, Bihar</span>
        </div>
        <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5">
          Contact Us <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
