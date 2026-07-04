import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { ListChecks, Code2, CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { functions } from '../../firebase/config';
import {
  getStudentEnrollments, getTestsForCourses, getStudentTestAttempts, submitTestAttempt,
} from '../../firebase/firestore';

export default function Tests() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Coding-test state
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const enrollments = await getStudentEnrollments(user.uid);
      const courseIds = enrollments.map((e) => e.courseId);
      const [testData, attemptData] = await Promise.all([
        getTestsForCourses(courseIds),
        getStudentTestAttempts(user.uid),
      ]);
      setTests(testData);
      setAttempts(attemptData);
    } catch {
      setError('Could not load tests right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const attemptFor = (testId) => attempts.find((a) => a.testId === testId);

  const openTest = (test) => {
    setActive(test);
    setAnswers({});
    setRunResult(null);
    setCode(test.starterCode || '');
  };

  const handleSubmitMcq = async () => {
    setSubmitting(true);
    try {
      const score = active.questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
      await submitTestAttempt({
        testId: active.id, studentId: user.uid, answers, score, total: active.questions.length,
      });
      await load();
      setActive(null);
    } catch {
      setError('Could not submit your test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunAndSubmitCode = async () => {
    setRunning(true);
    setError('');
    try {
      const runCode = httpsCallable(functions, 'runCode');
      const result = await runCode({ language: active.language, sourceCode: code, stdin: active.stdin || '' });
      const output = result.data.stdout.trim();
      const expected = (active.expectedOutput || '').trim();
      const passed = output === expected;
      setRunResult({ ...result.data, passed });

      setSubmitting(true);
      await submitTestAttempt({
        testId: active.id, studentId: user.uid, answers: { code }, score: passed ? 1 : 0, total: 1,
      });
      await load();
    } catch (err) {
      setError(err?.message || 'Could not run your code. Make sure the runCode Cloud Function is deployed.');
    } finally {
      setRunning(false);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Online Tests</h1>
      <p className="mt-1 text-sm text-ink-400">Real MCQ and coding tests from your enrolled courses.</p>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-ink-400">
          <Loader2 size={18} className="animate-spin" /> Loading tests...
        </div>
      ) : error && !active ? (
        <div className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      ) : tests.length === 0 ? (
        <div className="mt-10 text-center text-sm text-ink-400">
          No tests available yet for your enrolled courses.
        </div>
      ) : !active ? (
        <div className="mt-6 space-y-4">
          {tests.map((t) => {
            const attempt = attemptFor(t.id);
            return (
              <div key={t.id} className="flex flex-col gap-4 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    {t.type === 'coding' ? <Code2 size={18} /> : <ListChecks size={18} />}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink-900 dark:text-white">{t.title}</p>
                    <p className="text-xs text-ink-400">
                      {t.courseTitle} · {t.type === 'coding' ? `Coding (${t.language})` : `${t.questions?.length || 0} questions`}
                    </p>
                  </div>
                </div>
                {attempt ? (
                  <span className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold shrink-0 ${
                    attempt.score === attempt.total ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                  }`}>
                    <CheckCircle2 size={13} /> {t.type === 'coding' ? (attempt.score ? 'Passed' : 'Failed') : `Scored ${attempt.score}/${attempt.total}`}
                  </span>
                ) : (
                  <button onClick={() => openTest(t)} className="btn-primary text-sm shrink-0">Take Test</button>
                )}
              </div>
            );
          })}
        </div>
      ) : active.type === 'coding' ? (
        <div className="mt-6 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">{active.title}</h3>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">{active.problemStatement}</p>
          <p className="mt-1 text-xs text-ink-400">Language: {active.language}</p>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            spellCheck={false}
            className="mt-4 w-full rounded-xl border border-ink-100 dark:border-white/10 bg-ink-950 p-4 font-mono text-sm text-emerald-300 outline-none focus:border-primary"
          />
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          {runResult && (
            <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${runResult.passed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-red-500/10 text-red-500'}`}>
              <p className="flex items-center gap-1.5 font-medium">
                {runResult.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {runResult.passed ? 'Correct output — test passed!' : 'Output did not match — test failed.'}
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-xs opacity-80">stdout: {runResult.stdout || '(empty)'}</pre>
              {runResult.stderr && <pre className="mt-1 whitespace-pre-wrap font-mono text-xs opacity-80">stderr: {runResult.stderr}</pre>}
            </div>
          )}
          <div className="mt-5 flex gap-2">
            <button onClick={() => setActive(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleRunAndSubmitCode} disabled={running || submitting} className="btn-primary flex-1 disabled:opacity-50">
              {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} {running ? 'Running...' : 'Run & Submit'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-6">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white">{active.title}</h3>
          <div className="mt-5 space-y-6">
            {active.questions.map((q, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{i + 1}. {q.q}</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                      className={`rounded-lg border px-3 py-2 text-left text-sm ${
                        answers[i] === oi ? 'border-primary bg-primary/10 text-primary' : 'border-ink-100 dark:border-white/10 text-ink-600 dark:text-ink-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={() => setActive(null)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={handleSubmitMcq}
              disabled={submitting || Object.keys(answers).length !== active.questions.length}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Test'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
