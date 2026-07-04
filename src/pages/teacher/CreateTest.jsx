import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import {
  ListChecks, Plus, Trash2, Sparkles, FileUp, Type, Loader2, CheckCircle2,
} from 'lucide-react';
import { ALL_COURSES } from '../../data/courses';
import { useAuth } from '../../context/AuthContext';
import { functions } from '../../firebase/config';
import { createTest, getTestsByTeacher } from '../../firebase/firestore';
import { extractTextFromPdf } from '../../utils/extractPdfText';

const emptyQuestion = () => ({ q: '', options: ['', '', '', ''], answer: 0 });

export default function CreateTest() {
  const { user, profile } = useAuth();
  const [testType, setTestType] = useState('mcq');
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(ALL_COURSES[0]?.id || '');
  const [questions, setQuestions] = useState([emptyQuestion()]);

  const [codingForm, setCodingForm] = useState({
    problemStatement: '', language: 'python', starterCode: '', stdin: '', expectedOutput: '',
  });

  const [sourceMode, setSourceMode] = useState('text'); // 'text' | 'pdf'
  const [sourceText, setSourceText] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [myTests, setMyTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoadingTests(true);
    try {
      const data = await getTestsByTeacher(user.uid);
      setMyTests(data);
    } catch { /* non-fatal */ }
    setLoadingTests(false);
  };
  useEffect(() => { load(); }, [user]);

  const handlePdfUpload = async (file) => {
    if (!file) return;
    setGenError('');
    try {
      const text = await extractTextFromPdf(file);
      setSourceText(text);
    } catch {
      setGenError('Could not read that PDF. Try a different file, or paste the text instead.');
    }
  };

  const handleGenerate = async () => {
    setGenError('');
    setGenerating(true);
    try {
      const generateMcqs = httpsCallable(functions, 'generateMcqs');
      const result = await generateMcqs({ text: sourceText, numQuestions });
      const generated = result.data.questions.map((q) => ({
        q: q.q, options: q.options, answer: q.answer,
      }));
      setQuestions(generated);
    } catch (err) {
      setGenError(err?.message || 'AI generation failed. Please check your setup and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  const updateQ = (i, val) => setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, q: val } : q)));
  const updateOpt = (i, oi, val) => setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, options: q.options.map((o, oidx) => (oidx === oi ? val : o)) } : q)));

  const handlePublish = async (e) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const course = ALL_COURSES.find((c) => c.id === courseId);
      await createTest({
        teacherId: user.uid,
        teacherName: profile?.name || 'Teacher',
        courseId,
        courseTitle: course?.title || '',
        title,
        type: testType,
        questions: testType === 'mcq' ? questions : null,
        problemStatement: testType === 'coding' ? codingForm.problemStatement : null,
        starterCode: testType === 'coding' ? codingForm.starterCode : null,
        language: testType === 'coding' ? codingForm.language : null,
        stdin: testType === 'coding' ? codingForm.stdin : null,
        expectedOutput: testType === 'coding' ? codingForm.expectedOutput : null,
      });
      setPublished(true);
      setTimeout(() => setPublished(false), 2500);
      setTitle('');
      setQuestions([emptyQuestion()]);
      setCodingForm({ problemStatement: '', language: 'python', starterCode: '', stdin: '', expectedOutput: '' });
      setSourceText('');
      load();
    } catch {
      setGenError('Could not publish the test. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
        <ListChecks size={22} className="text-primary" /> Create Test
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Paste your notes or upload a PDF and let AI draft the quiz — or build questions manually. Review before publishing.
      </p>

      {/* Test type toggle */}
      <div className="mt-6 flex gap-2">
        {[{ key: 'mcq', label: 'MCQ Test' }, { key: 'coding', label: 'Coding Test' }].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTestType(t.key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
              testType === t.key ? 'bg-brand-gradient text-white shadow-glow' : 'bg-ink-50 dark:bg-white/5 text-ink-600 dark:text-ink-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* AI generation panel — MCQ only */}
      {testType === 'mcq' && (
      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="flex items-center gap-2 font-display font-semibold text-ink-900 dark:text-white">
          <Sparkles size={18} className="text-primary" /> Generate with AI
        </h3>
        <div className="mt-3 flex gap-2">
          {[{ key: 'text', icon: Type, label: 'Paste Text' }, { key: 'pdf', icon: FileUp, label: 'Upload PDF' }].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setSourceMode(m.key)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                sourceMode === m.key ? 'border-primary bg-primary/10 text-primary' : 'border-ink-100 dark:border-white/10 text-ink-500 dark:text-ink-100'
              }`}
            >
              <m.icon size={13} /> {m.label}
            </button>
          ))}
        </div>

        {sourceMode === 'text' ? (
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={6}
            className="input-field mt-3 resize-none"
            placeholder="Paste chapter notes, a textbook excerpt, or any study material here..."
          />
        ) : (
          <label className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 p-6 text-center">
            <FileUp size={24} className="text-primary" />
            <span className="text-xs text-ink-500 dark:text-ink-100">
              {sourceText ? 'PDF text extracted — ready to generate' : 'Click to upload a PDF'}
            </span>
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handlePdfUpload(e.target.files?.[0])} />
          </label>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-100">
            Questions:
            <input
              type="number" min={1} max={15} value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              className="input-field !w-16 !py-1.5 text-center"
            />
          </label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || sourceText.trim().length < 50}
            className="btn-primary !py-2 text-sm disabled:opacity-50"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>
        {genError && <p className="mt-2 text-xs text-red-500">{genError}</p>}
        <p className="mt-2 text-[11px] text-ink-400">
          Requires the `generateMcqs` Cloud Function to be deployed with your Anthropic API key —
          see <code className="font-mono">functions/index.js</code> and the README.
        </p>
      </div>
      )}

      {/* Manual builder / review */}
      <form onSubmit={handlePublish} className="mt-6 max-w-2xl space-y-5">
        {published && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-600">
            <CheckCircle2 size={16} /> Test published.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Test title (e.g. Chapter 4 Quiz)" />
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="input-field">
            {ALL_COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {testType === 'mcq' ? (
          <>
            {questions.map((q, i) => (
              <div key={i} className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
                <div className="flex items-center justify-between gap-3">
                  <input required value={q.q} onChange={(e) => updateQ(i, e.target.value)} className="input-field" placeholder={`Question ${i + 1}`} />
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(i)} className="shrink-0 text-red-400"><Trash2 size={16} /></button>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`answer-${i}`}
                        checked={q.answer === oi}
                        onChange={() => setQuestions((qs) => qs.map((qq, idx) => (idx === i ? { ...qq, answer: oi } : qq)))}
                        className="accent-primary"
                      />
                      <input required value={opt} onChange={(e) => updateOpt(i, oi, e.target.value)} className="input-field !py-2 text-sm" placeholder={`Option ${oi + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="btn-outline"><Plus size={16} /> Add Question</button>
          </>
        ) : (
          <div className="rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 space-y-4">
            <textarea
              required value={codingForm.problemStatement}
              onChange={(e) => setCodingForm({ ...codingForm, problemStatement: e.target.value })}
              rows={3} className="input-field resize-none" placeholder="Problem statement (e.g. Read two integers and print their sum)"
            />
            <div className="grid grid-cols-2 gap-3">
              <select value={codingForm.language} onChange={(e) => setCodingForm({ ...codingForm, language: e.target.value })} className="input-field">
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <input value={codingForm.stdin} onChange={(e) => setCodingForm({ ...codingForm, stdin: e.target.value })} className="input-field" placeholder="Sample input (stdin), optional" />
            </div>
            <textarea
              value={codingForm.starterCode}
              onChange={(e) => setCodingForm({ ...codingForm, starterCode: e.target.value })}
              rows={4} className="input-field resize-none font-mono text-sm" placeholder="Starter code shown to students (optional)"
            />
            <input
              required value={codingForm.expectedOutput}
              onChange={(e) => setCodingForm({ ...codingForm, expectedOutput: e.target.value })}
              className="input-field" placeholder="Expected exact stdout output (used to auto-grade)"
            />
            <p className="text-[11px] text-ink-400">
              The student's code runs in a real sandboxed judge (Judge0) and its output is compared
              exactly to the expected output above. Requires the `runCode` Cloud Function + a free
              RapidAPI key — see the README.
            </p>
          </div>
        )}

        <button type="submit" disabled={publishing} className="btn-primary w-full disabled:opacity-60">
          {publishing ? <Loader2 size={16} className="animate-spin" /> : null} {publishing ? 'Publishing...' : 'Publish Test'}
        </button>
      </form>

      <div className="mt-10 max-w-2xl">
        <h3 className="font-display font-semibold text-ink-900 dark:text-white">Your Published Tests</h3>
        {loadingTests ? (
          <p className="mt-3 text-sm text-ink-400">Loading...</p>
        ) : myTests.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">No tests published yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-ink-100 dark:divide-white/10 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40">
            {myTests.map((t) => (
              <div key={t.id} className="p-4">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">{t.title}</p>
                <p className="text-xs text-ink-400">
                  {t.courseTitle} · {t.type === 'coding' ? 'Coding test' : `${t.questions?.length || 0} MCQ questions`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
