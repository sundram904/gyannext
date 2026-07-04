import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, AlertCircle } from 'lucide-react';
import { loginWithEmail } from '../../firebase/auth';

// Intentionally NOT linked from the Navbar or Footer. Reachable only by direct URL: /admin-login
export default function AdminLogin() {
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
      if (profile?.role !== 'admin') {
        setError('This login is restricted to super admins.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-400">
          <ShieldAlert size={22} />
        </div>
        <h1 className="mt-4 text-center font-display text-xl font-bold text-white">Super Admin Access</h1>
        <p className="mt-1 text-center text-xs text-ink-400">Restricted area. Unauthorized access attempts are logged.</p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              required type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-ink-500 outline-none focus:border-red-400"
              placeholder="admin@gyannext.com"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              required type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-ink-500 outline-none focus:border-red-400"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
