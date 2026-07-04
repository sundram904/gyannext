import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Clock3 } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { loginWithEmail } from '../../firebase/auth';

export default function TeacherLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPending(false);
    setRejected(false);
    setLoading(true);
    try {
      const { profile } = await loginWithEmail(form.email, form.password);
      if (profile?.role !== 'teacher') {
        setError('This account is not registered as a teacher.');
      } else if (profile?.status === 'pending') {
        setPending(true);
      } else if (profile?.status === 'rejected') {
        setRejected(true);
      } else if (profile?.status === 'suspended') {
        setError('Your account has been suspended. Please contact GyanNext support.');
      } else {
        navigate('/teacher/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Teacher Login" subtitle="Manage your classes, content and students.">
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {pending && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-300">
          <Clock3 size={16} /> Your account is awaiting admin approval. You'll get an email once verified.
        </div>
      )}
      {rejected && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={16} /> Your teacher application was not approved. Contact support for details.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" placeholder="you@email.com" />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-600 dark:text-ink-100">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10" placeholder="••••••••" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <LogIn size={16} /> {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-400">
        Want to teach on GyanNext? <Link to="/register-teacher" className="font-semibold text-primary hover:underline">Apply as a teacher</Link>
      </p>
      <p className="mt-2 text-center text-sm text-ink-400">
        Are you a student? <Link to="/login" className="font-semibold text-primary hover:underline">Student login</Link>
      </p>
    </AuthLayout>
  );
}
