import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { loginWithEmail } from '../../firebase/auth';

export default function StudentLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { profile } = await loginWithEmail(form.email, form.password);
      if (profile?.status === 'suspended') {
        setError('Your account has been suspended. Please contact GyanNext support.');
        return;
      }
      if (profile?.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue learning on GyanNext.">
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={16} /> {error}
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
        New to GyanNext? <Link to="/register" className="font-semibold text-primary hover:underline">Create a student account</Link>
      </p>
      <p className="mt-2 text-center text-sm text-ink-400">
        Are you an educator? <Link to="/teacher-login" className="font-semibold text-primary hover:underline">Teacher login</Link>
      </p>
    </AuthLayout>
  );
}
