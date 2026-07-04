import { useState, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Sparkles, Send, Bot, User, AlertCircle } from 'lucide-react';
import { functions } from '../../firebase/config';

const INITIAL = [
  { role: 'assistant', text: "Hi! I'm your GyanNext AI Doubt Assistant. Ask me anything about your course — Maths, Python, DSA, whatever's on your mind." },
];

export default function AiDoubtAssistant() {
  const [messages, setMessages] = useState(INITIAL);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const question = input;
    const userMsg = { role: 'user', text: question };
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const askDoubt = httpsCallable(functions, 'askDoubt');
      const result = await askDoubt({ question, history });
      setMessages((m) => [...m, { role: 'assistant', text: result.data.answer }]);
    } catch (err) {
      setError(err?.message || 'Could not reach the AI assistant. Make sure the Cloud Function is deployed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
          <Sparkles size={22} className="text-primary" /> AI Doubt Assistant
        </h1>
        <p className="mt-1 text-sm text-ink-400">Get instant help, any time — day or night.</p>
      </div>

      <div className="mt-5 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-ink-100 dark:border-white/10 bg-white dark:bg-ink-900/40 p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === 'user' ? 'bg-secondary/10 text-secondary' : 'bg-brand-gradient text-white'}`}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-primary text-white' : 'bg-ink-50 dark:bg-white/5 text-ink-700 dark:text-ink-100'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <p className="text-xs text-ink-400 pl-11">Thinking...</p>}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs text-red-500">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="input-field"
          placeholder="Ask a doubt about any course..."
        />
        <button type="submit" disabled={loading} className="btn-primary !px-4 shrink-0 disabled:opacity-60"><Send size={16} /></button>
      </form>
    </div>
  );
}
