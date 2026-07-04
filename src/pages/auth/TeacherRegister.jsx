import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, BookOpen, UserPlus, AlertCircle, Info } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { registerTeacher } from '../../firebase/auth';

export default function TeacherRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', subjects: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerTeacher({ ...form, subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean) });
      navigate('/teacher-login');
    } catch (err) {
      setError(err?.code === 'auth/email-already-in-use' ? 'This email is already registered.' : 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Apply to teach on GyanNext" subtitle="Your account is reviewed and approved by our admin team before activation.">
      <div className="mb-5 flex items-start gap-2 rounded-xl bg-primary/10 px-4 py-3 text-xs text-primary-700 dark:text-primary-300">
        <Info size={15} className="mt-0.5 shrink-0" /> Applications are usually reviewed within 24–48 hours.
      </div>
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input required value={form.name} onChange={update('name')} className="input-field pl-10" placeholder="Full name" />
        </div>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input required type="email" value={form.email} onChange={update('email')} className="input-field pl-10" placeholder="Email address" />
        </div>
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input required value={form.phone} onChange={update('phone')} className="input-field pl-10" placeholder="Phone number" />
        </div>
        <div className="relative">
          <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input required value={form.subjects} onChange={update('subjects')} className="input-field pl-10" placeholder="Subjects (e.g. Python, DSA)" />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input required type="password" value={form.password} onChange={update('password')} className="input-field pl-10" placeholder="Create password" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <UserPlus size={16} /> {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-400">
        Already approved? <Link to="/teacher-login" className="font-semibold text-primary hover:underline">Teacher login</Link>
      </p>
    </AuthLayout>
  );
}
