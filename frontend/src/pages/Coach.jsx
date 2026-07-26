import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Send, Sparkles } from 'lucide-react';

function Coach() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadHistory() {
    try {
      const res = await api.get('/coach/history');
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error loading coach history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    // Show the user's message immediately, don't wait for the round trip
    const optimisticUserMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput('');
    setSending(true);
    setError('');

    try {
      const res = await api.post('/coach/message', { message: trimmed });
      const coachReply = {
        id: `temp-reply-${Date.now()}`,
        role: 'assistant',
        content: res.data.reply,
      };
      setMessages((prev) => [...prev, coachReply]);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't reach the coach. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-3xl w-full mx-auto px-6 py-8 flex flex-col flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} /> AI Coach
          </h1>
          <p className="text-gray-500 mt-1">Ask about your progress, streaks, or just check in.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 flex-1 flex flex-col min-h-[60vh]">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingHistory ? (
              <p className="text-center text-gray-400 text-sm">Loading conversation...</p>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="bg-indigo-50 text-indigo-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <Sparkles size={26} />
                </div>
                <p className="font-semibold text-gray-900">Say hey to your coach</p>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  It knows your streak, points, and recent check-ins — ask it anything about your progress.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-400">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-gray-100 p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach something..."
              disabled={sending}
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50 flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
          {error && <p className="text-red-600 text-xs px-4 pb-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Coach;