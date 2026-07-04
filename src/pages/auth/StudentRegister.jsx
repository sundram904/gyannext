import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Users, UserPlus, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { registerStudent } from '../../firebase/auth';

export default function StudentRegister() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', parentName: '', parentPhone: '',
  });
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
      await registerStudent(form);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err?.code === 'auth/email-already-in-use' ? 'This email is already registered.' : 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your student account" subtitle="Join 48,000+ learners on GyanNext.">
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
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input required type="password" value={form.password} onChange={update('password')} className="input-field pl-10" placeholder="Create password" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={form.parentName} onChange={update('parentName')} className="input-field pl-10" placeholder="Parent name" />
          </div>
          <input value={form.parentPhone} onChange={update('parentPhone')} className="input-field" placeholder="Parent phone" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <UserPlus size={16} /> {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-400">
        Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
