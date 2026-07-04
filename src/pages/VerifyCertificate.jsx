import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BadgeCheck, XCircle, Loader2 } from 'lucide-react';
import { getCertificateByCertId } from '../firebase/firestore';
import Logo from '../components/ui/Logo';

function formatDate(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function VerifyCertificate() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getCertificateByCertId(certId);
        if (data) setCert(data);
        else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [certId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-radial px-4 py-16">
      <Logo className="mb-8" />
      <div className="w-full max-w-md rounded-3xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/60 p-8 text-center shadow-card">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm text-ink-400">Verifying certificate...</p>
          </div>
        ) : error || !cert ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-500">
              <XCircle size={28} />
            </div>
            <h1 className="font-display text-lg font-bold text-ink-900 dark:text-white">Certificate Not Found</h1>
            <p className="text-sm text-ink-400">
              We couldn't verify certificate ID <span className="font-mono">{certId}</span>. It may be invalid or has been revoked.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
              <BadgeCheck size={28} />
            </div>
            <h1 className="font-display text-lg font-bold text-ink-900 dark:text-white">Certificate Verified ✓</h1>
            <p className="text-sm text-ink-400">This is a genuine certificate issued by GyanNext.</p>

            <div className="mt-4 w-full space-y-3 rounded-2xl bg-ink-50 dark:bg-white/5 p-5 text-left">
              <div>
                <p className="text-xs text-ink-400">Awarded to</p>
                <p className="font-display font-semibold text-ink-900 dark:text-white">{cert.studentName}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Course</p>
                <p className="font-medium text-ink-800 dark:text-ink-100">{cert.courseTitle}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Issued On</p>
                <p className="font-medium text-ink-800 dark:text-ink-100">{formatDate(cert.issuedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Certificate ID</p>
                <p className="font-mono text-xs text-ink-800 dark:text-ink-100">{cert.certId}</p>
              </div>
            </div>
          </div>
        )}
        <Link to="/" className="btn-outline mt-6 w-full">Back to GyanNext</Link>
      </div>
    </div>
  );
}
