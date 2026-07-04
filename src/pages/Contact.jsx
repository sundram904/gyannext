import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon } from '../components/ui/SocialIcons';
import { submitContactMessage } from '../firebase/firestore';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await submitContactMessage(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Could not send your message right now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-app py-14">
      <div className="max-w-xl">
        <span className="section-eyebrow">Contact Us</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">We'd love to hear from you</h1>
        <p className="mt-3 text-ink-400">Questions about courses, admissions, or partnerships — send us a message and we'll get back within a few hours.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6 sm:p-8">
          {sent && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 size={16} /> Message sent! We'll be in touch shortly.
            </div>
          )}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Full Name</label>
              <input required name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Email</label>
              <input required type="email" name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@email.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Subject</label>
              <input required name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="How can we help?" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Message</label>
              <textarea required name="message" value={form.message} onChange={handleChange} rows={5} className="input-field resize-none" placeholder="Tell us more..." />
            </div>
            <button type="submit" disabled={sending} className="btn-primary sm:col-span-2 disabled:opacity-60">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="space-y-5">
          {[
            { icon: Mail, label: 'Email us', value: 'support@gyannext.com' },
            { icon: Phone, label: 'Call us', value: '+91 98765 43210' },
            { icon: MapPin, label: 'Visit us', value: 'Boring Road, Patna, Bihar, India' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-ink-400">{item.label}</p>
                <p className="font-display font-semibold text-ink-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
            {[FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon].map((Icon, i) => (
              <a key={i} href="#" aria-label="social" className="grid h-10 w-10 place-items-center rounded-full bg-ink-50 dark:bg-white/5 text-ink-600 dark:text-ink-100 hover:bg-primary/10 hover:text-primary transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-ink-100 dark:border-white/10">
        <iframe
          title="GyanNext location"
          src="https://www.google.com/maps?q=Patna,Bihar,India&output=embed"
          width="100%"
          height="360"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
