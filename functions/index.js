const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

admin.initializeApp();

// Set this once with:
//   firebase functions:secrets:set ANTHROPIC_API_KEY
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

/**
 * Callable function: generateMcqs
 * Input:  { text: string, numQuestions?: number }
 * Output: { questions: [{ q, options: [4 strings], answer: 0-3 }] }
 *
 * Only signed-in users with role 'teacher' or 'admin' may call this — enforced below
 * by reading their Firestore profile, since custom claims aren't set up in this project.
 */
exports.generateMcqs = onCall({ secrets: [ANTHROPIC_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const profileSnap = await admin.firestore().collection('users').doc(request.auth.uid).get();
  const role = profileSnap.data()?.role;
  if (role !== 'teacher' && role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only teachers or admins can generate tests.');
  }

  const text = (request.data?.text || '').trim();
  const numQuestions = Math.min(Math.max(parseInt(request.data?.numQuestions, 10) || 5, 1), 15);

  if (text.length < 50) {
    throw new HttpsError('invalid-argument', 'Please provide more source material (at least a few sentences).');
  }
  if (text.length > 20000) {
    throw new HttpsError('invalid-argument', 'Source text is too long — please shorten it to under ~20,000 characters.');
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

  const prompt = `You are generating a multiple-choice quiz for a school/programming course based only on the study material below. Create exactly ${numQuestions} questions.

Respond with ONLY valid JSON (no markdown fences, no commentary) matching this exact shape:
{"questions":[{"q":"question text","options":["A","B","C","D"],"answer":0}]}

Rules:
- "answer" is the 0-based index of the correct option in "options".
- Each question must have exactly 4 options.
- Base every question strictly on the material provided — do not invent facts outside it.
- Vary difficulty and avoid trivial or duplicate questions.

STUDY MATERIAL:
"""
${text}
"""`;

  let response;
  try {
    response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    throw new HttpsError('internal', 'AI generation failed. Please try again.');
  }

  const raw = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new HttpsError('internal', 'AI returned an unexpected format. Please try again.');
  }

  const questions = (parsed.questions || []).filter(
    (q) => q?.q && Array.isArray(q.options) && q.options.length === 4 && typeof q.answer === 'number'
  );

  if (questions.length === 0) {
    throw new HttpsError('internal', 'No valid questions were generated. Please try again with different material.');
  }

  return { questions };
});

/**
 * Callable function: askDoubt
 * Input:  { question: string, history?: [{role: 'user'|'assistant', text: string}] }
 * Output: { answer: string }
 *
 * Any signed-in user (student or teacher) can call this — it's a tutoring assistant,
 * not a privileged action.
 */
exports.askDoubt = onCall({ secrets: [ANTHROPIC_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const question = (request.data?.question || '').trim();
  if (!question) {
    throw new HttpsError('invalid-argument', 'Please ask a question.');
  }
  if (question.length > 4000) {
    throw new HttpsError('invalid-argument', 'Please keep your question under 4000 characters.');
  }

  const history = Array.isArray(request.data?.history) ? request.data.history.slice(-10) : [];
  const messages = history
    .filter((m) => m?.text && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: m.text }))
    .concat([{ role: 'user', content: question }]);

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

  let response;
  try {
    response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: 'You are a patient, encouraging tutor for GyanNext, an Indian school + programming learning platform. Explain concepts clearly and step-by-step, using simple language and examples suited to school (CBSE/Bihar Board) and beginner programming students. Keep answers focused and not overly long.',
      messages,
    });
  } catch (err) {
    throw new HttpsError('internal', 'The AI assistant is unavailable right now. Please try again.');
  }

  const answer = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
  return { answer: answer || "I couldn't come up with an answer — could you rephrase your question?" };
});

// Set this once with:
//   firebase functions:secrets:set RAPIDAPI_KEY
// Get a free key at https://rapidapi.com/judge0-official/api/judge0-ce
const RAPIDAPI_KEY = defineSecret('RAPIDAPI_KEY');

const LANGUAGE_IDS = { python: 71, javascript: 63, c: 50, cpp: 54, java: 62 };

/**
 * Callable function: runCode
 * Input:  { language: 'python'|'javascript'|'c'|'cpp'|'java', sourceCode: string, stdin?: string }
 * Output: { stdout, stderr, compileOutput, status }
 *
 * Executes code in a real sandboxed judge (Judge0 CE) — never run untrusted code in the
 * browser or directly in a Cloud Function process.
 */
exports.runCode = onCall({ secrets: [RAPIDAPI_KEY], timeoutSeconds: 30 }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const { language, sourceCode, stdin } = request.data || {};
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    throw new HttpsError('invalid-argument', 'Unsupported language.');
  }
  if (!sourceCode || sourceCode.length > 20000) {
    throw new HttpsError('invalid-argument', 'Please provide source code under 20,000 characters.');
  }

  let res;
  try {
    res = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY.value(),
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({ source_code: sourceCode, language_id: languageId, stdin: stdin || '' }),
    });
  } catch {
    throw new HttpsError('internal', 'Could not reach the code execution service.');
  }

  if (!res.ok) {
    throw new HttpsError('internal', 'The code execution service returned an error. Check your RAPIDAPI_KEY.');
  }

  const result = await res.json();
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    compileOutput: result.compile_output || '',
    status: result.status?.description || 'Unknown',
  };
});
