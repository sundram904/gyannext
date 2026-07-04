import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, DatabaseBackup, Save, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { getSettings, updateSettings } from '../../firebase/firestore';

const defaults = { siteName: 'GyanNext', supportEmail: 'support@gyannext.com', maintenanceMode: false };

export default function AdminSettings() {
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getSettings();
        if (data) setForm({ ...defaults, ...data });
      } catch {
        setError('Could not load settings — showing defaults.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <SettingsIcon size={22} className="text-primary" /> Website Settings
      </h1>
      <p className="mt-1 text-sm text-ink-400">Saved to Firestore — read by the site in real time.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">General</h3>
          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : (
            <>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Site Name</label>
                  <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Support Email</label>
                  <input value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} className="input-field" />
                </div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={form.maintenanceMode} onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })} className="h-4 w-4 accent-primary" />
                  <span className="text-sm text-ink-600 dark:text-ink-100">Enable maintenance mode</span>
                </label>
              </div>
              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
              {saved && <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-500"><CheckCircle2 size={14} /> Settings saved.</p>}
              <button onClick={handleSave} disabled={saving} className="btn-primary mt-5 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="flex items-center gap-2 font-display font-semibold text-ink-900 dark:text-white">
            <DatabaseBackup size={18} className="text-primary" /> Backup & Restore
          </h3>
          <p className="mt-2 text-sm text-ink-400">
            Firestore backups aren't something a web app can trigger from the browser — Google
            requires this through Cloud infrastructure directly. Use one of these:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-500 dark:text-ink-100">
            <li>• Firebase Console → Firestore Database → <span className="font-medium">Backups</span> tab (schedule automatic daily backups)</li>
            <li>• Or run <code className="rounded bg-ink-100 dark:bg-white/10 px-1.5 py-0.5 text-xs">gcloud firestore export</code> via the Google Cloud CLI for a one-off manual export</li>
          </ul>
          <a
            href="https://console.firebase.google.com"
            target="_blank" rel="noreferrer"
            className="btn-outline mt-5 inline-flex"
          >
            Open Firebase Console <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
