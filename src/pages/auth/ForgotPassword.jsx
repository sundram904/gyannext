import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { resetPassword } from '../../firebase/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('Could not find an account with that email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 size={16} /> Reset link sent! Check your inbox.
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@email.com" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              <Send size={16} /> {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </>
      )}
      <p className="mt-6 text-center text-sm text-ink-400">
        Remembered it? <Link to="/login" className="font-semibold text-primary hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
