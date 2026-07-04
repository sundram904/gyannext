import { useState } from 'react';
import { User, Users, BookOpen, Upload, CheckCircle2, ArrowRight, ArrowLeft, FileCheck, Loader2 } from 'lucide-react';
import { ALL_COURSES, CATEGORIES } from '../data/courses';
import { submitAdmission } from '../firebase/firestore';

const STEPS = [
  { id: 1, label: 'Student Details', icon: User },
  { id: 2, label: 'Parent Info', icon: Users },
  { id: 3, label: 'Courses', icon: BookOpen },
  { id: 4, label: 'Documents', icon: Upload },
];

const initialState = {
  studentName: '', dob: '', gender: '', email: '', phone: '',
  parentName: '', parentPhone: '', parentEmail: '', relation: 'Father',
  board: 'CBSE', selectedCourses: [],
  photo: null, idProof: null, marksheet: null,
};

export default function Admission() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleCourse = (id) => {
    setForm((f) => ({
      ...f,
      selectedCourses: f.selectedCourses.includes(id)
        ? f.selectedCourses.filter((c) => c !== id)
        : [...f.selectedCourses, id],
    }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Document files (photo/ID/marksheet) require Firebase Storage upload — this saves the
      // application data now; wire Storage uploads here to attach download URLs before writing.
      const { photo, idProof, marksheet, ...applicationData } = form;
      await submitAdmission({
        ...applicationData,
        documentsNote: [photo, idProof, marksheet].filter(Boolean).map((f) => f.name).join(', ') || 'None uploaded',
      });
      setSubmitted(true);
    } catch {
      setError('Could not submit your application right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-900 dark:text-white">Application submitted!</h1>
        <p className="mt-2 max-w-md text-ink-400">
          Thanks {form.studentName || 'there'} — our admissions team will review your application and reach
          out on {form.parentPhone || form.phone || 'your registered number'} within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="container-app py-14">
      <div className="max-w-xl">
        <span className="section-eyebrow">Admission</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">Start your GyanNext journey</h1>
        <p className="mt-3 text-ink-400">Fill out the form below — it takes less than 5 minutes.</p>
      </div>

      {/* Stepper */}
      <div className="mt-10 flex items-center justify-between overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center min-w-[120px]">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`grid h-11 w-11 place-items-center rounded-full border-2 transition-colors ${
                  step >= s.id ? 'border-primary bg-brand-gradient text-white shadow-glow' : 'border-ink-200 dark:border-white/10 text-ink-400'
                }`}
              >
                <s.icon size={18} />
              </div>
              <span className={`text-xs font-medium ${step >= s.id ? 'text-primary' : 'text-ink-400'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 rounded ${step > s.id ? 'bg-primary' : 'bg-ink-100 dark:bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6 sm:p-8">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Student Full Name</label>
              <input required value={form.studentName} onChange={(e) => update('studentName', e.target.value)} className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Date of Birth</label>
              <input required type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Gender</label>
              <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="input-field">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Student Phone (optional)</label>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" placeholder="10-digit number" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Email</label>
              <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" placeholder="student@email.com" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Parent / Guardian Name</label>
              <input required value={form.parentName} onChange={(e) => update('parentName', e.target.value)} className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Relation</label>
              <select value={form.relation} onChange={(e) => update('relation', e.target.value)} className="input-field">
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Parent Phone</label>
              <input required value={form.parentPhone} onChange={(e) => update('parentPhone', e.target.value)} className="input-field" placeholder="10-digit number" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Parent Email (optional)</label>
              <input type="email" value={form.parentEmail} onChange={(e) => update('parentEmail', e.target.value)} className="input-field" placeholder="parent@email.com" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-100">Board (for School courses)</label>
            <div className="flex gap-3">
              {['CBSE', 'Bihar Board'].map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => update('board', b)}
                  className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    form.board === b ? 'border-primary bg-primary/10 text-primary' : 'border-ink-100 dark:border-white/10 text-ink-500 dark:text-ink-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <p className="mt-6 mb-2 text-sm font-medium text-ink-600 dark:text-ink-100">
              Select course(s) — you can choose more than one
            </p>
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{cat.label}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ALL_COURSES.filter((c) => c.category === cat.id).map((c) => {
                    const selected = form.selectedCourses.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCourse(c.id)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                          selected ? 'border-primary bg-primary/10 text-primary' : 'border-ink-100 dark:border-white/10 text-ink-500 dark:text-ink-100'
                        }`}
                      >
                        {selected ? <CheckCircle2 size={14} className="shrink-0" /> : <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-ink-300" />}
                        <span className="truncate">{c.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { key: 'photo', label: 'Student Photo' },
              { key: 'idProof', label: 'ID Proof (Aadhar / Birth Cert.)' },
              { key: 'marksheet', label: 'Last Marksheet' },
            ].map((doc) => (
              <label
                key={doc.key}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-200 dark:border-white/10 p-6 text-center transition-colors hover:border-primary"
              >
                {form[doc.key] ? <FileCheck size={26} className="text-emerald-500" /> : <Upload size={26} className="text-ink-400" />}
                <span className="text-xs font-medium text-ink-600 dark:text-ink-100">{doc.label}</span>
                <span className="text-[11px] text-ink-400">{form[doc.key] ? form[doc.key].name : 'Click to upload'}</span>
                <input type="file" className="hidden" onChange={(e) => update(doc.key, e.target.files?.[0] || null)} />
              </label>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-ink-100 dark:border-white/10 pt-6">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="btn-ghost disabled:opacity-0"
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < STEPS.length ? (
            <button type="button" onClick={next} className="btn-primary">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
        {error && <p className="mt-3 text-right text-xs font-medium text-red-500">{error}</p>}
      </form>
    </div>
  );
}
