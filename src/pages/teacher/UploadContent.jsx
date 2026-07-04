import { useEffect, useState } from 'react';
import { UploadCloud, Video, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { ALL_COURSES } from '../../data/courses';
import { useAuth } from '../../context/AuthContext';
import { uploadCourseFile } from '../../firebase/storage';
import { addCourseContent, getCourseContentByTeacher } from '../../firebase/firestore';

export default function UploadContent() {
  const { user, profile } = useAuth();
  const [type, setType] = useState('video');
  const [courseId, setCourseId] = useState(ALL_COURSES[0]?.id || '');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getCourseContentByTeacher(user.uid);
      setUploaded(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch { /* non-fatal */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    setError('');
    setUploading(true);
    try {
      const course = ALL_COURSES.find((c) => c.id === courseId);
      const { url, path } = await uploadCourseFile(courseId, file, setStatus);
      setStatus('Saving...');
      await addCourseContent({
        courseId, courseTitle: course?.title || '', teacherId: user.uid, teacherName: profile?.name || 'Teacher',
        type, title, fileUrl: url, storagePath: path,
      });
      setTitle('');
      setFile(null);
      load();
    } catch {
      setError('Upload failed. Check your Storage rules & connection, then try again.');
    } finally {
      setUploading(false);
      setStatus('');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Upload Content</h1>
      <p className="mt-1 text-sm text-ink-400">Real uploads to Firebase Storage — enrolled students can view these from My Courses instantly.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <div className="flex gap-2">
            {[{ key: 'video', label: 'Video', icon: Video }, { key: 'notes', label: 'PDF Notes', icon: FileText }].map((t) => (
              <button
                type="button"
                key={t.key}
                onClick={() => setType(t.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium ${
                  type === t.key ? 'border-primary bg-primary/10 text-primary' : 'border-ink-100 dark:border-white/10 text-ink-500 dark:text-ink-100'
                }`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="input-field mt-4">
            {ALL_COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field mt-4" placeholder="Lesson / chapter title" />
          <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-200 dark:border-white/10 p-8 text-center">
            <UploadCloud size={26} className="text-ink-400" />
            <span className="text-xs text-ink-500 dark:text-ink-100">{file ? file.name : `Click to upload ${type === 'video' ? 'a video file' : 'a PDF'}`}</span>
            <input required type="file" accept={type === 'video' ? 'video/*' : 'application/pdf'} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={uploading} className="btn-primary mt-5 w-full disabled:opacity-60">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : null} {uploading ? (status || 'Uploading...') : 'Upload'}
          </button>
        </form>

        <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">Your Uploads</h3>
          {loading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : uploaded.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">Nothing uploaded yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {uploaded.map((u) => (
                <a key={u.id} href={u.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-ink-50 dark:bg-white/5 px-4 py-3 hover:bg-primary/5">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{u.title}</p>
                    <p className="text-xs text-ink-400">{u.courseTitle} · {u.type === 'video' ? 'Video' : 'PDF Notes'}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
