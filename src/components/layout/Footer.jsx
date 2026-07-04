import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Logo from '../ui/Logo';
import { FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon } from '../ui/SocialIcons';

const explore = [
  { to: '/courses', label: 'All Courses' },
  { to: '/about', label: 'About Us' },
  { to: '/admission', label: 'Admission' },
  { to: '/contact', label: 'Contact' },
];

const learn = [
  { to: '/courses?category=school', label: 'School Learning' },
  { to: '/courses?category=programming', label: 'Programming' },
  { to: '/courses?category=skill', label: 'Skill Development' },
];

const account = [
  { to: '/login', label: 'Student Login' },
  { to: '/teacher-login', label: 'Teacher Login' },
  { to: '/register', label: 'Create Account' },
  { to: '/forgot-password', label: 'Forgot Password' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-100">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="container-app relative py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              GyanNext is a modern learning platform bringing school education, programming
              and career-ready skills together — with live classes, mentors and certificates
              that mean something.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-ink-100 transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {explore.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-ink-400 hover:text-primary-300 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Learn</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {learn.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-ink-400 hover:text-primary-300 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
            <h4 className="mt-6 font-display text-sm font-semibold text-white">Account</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {account.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-ink-400 hover:text-primary-300 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white">Stay in the loop</h4>
            <p className="mt-4 text-sm text-ink-400">Get new course drops and study tips in your inbox.</p>
            <form className="mt-3 flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-ink-400 outline-none focus:border-primary"
              />
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white" aria-label="Subscribe">
                <Send size={16} />
              </button>
            </form>
            <ul className="mt-6 space-y-2.5 text-sm text-ink-400">
              <li className="flex items-center gap-2"><Mail size={14} className="text-primary-300" /> support@gyannext.com</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-primary-300" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin size={14} className="text-primary-300" /> Patna, Bihar, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} GyanNext. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-primary-300">Privacy Policy</a>
            <a href="#" className="hover:text-primary-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
