import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CountUp from '../components/CountUp';
import { ArrowLeft, Flame, LogOut, Trophy, Send, MessageCircle } from 'lucide-react';

const POLL_INTERVAL_MS = 4000;

// Bold solid medal colors for the top 3 ranks — kept as real gold/silver/bronze
// meaning, just a bolder fill instead of the old pastel badges.
function getMedalStyle(idx) {
  if (idx === 0) return { bg: '#CA8A04', text: '#ffffff' }; // gold
  if (idx === 1) return { bg: '#94A3B8', text: '#ffffff' }; // silver
  if (idx === 2) return { bg: '#C2703D', text: '#ffffff' }; // bronze
  return { bg: '#F3F4F6', text: '#6B7280' }; // everyone else — unchanged neutral
}

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    loadGroupData();
    loadMessages();

    pollRef.current = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  async function loadGroupData() {
    setLoading(true);
    try {
      const [membersRes, leaderboardRes] = await Promise.all([
        api.get(`/groups/${groupId}/members`),
        api.get(`/groups/${groupId}/leaderboard`),
      ]);
      setMembers(membersRes.data.members);
      setLeaderboard(leaderboardRes.data.leaderboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    try {
      const res = await api.get(`/groups/${groupId}/messages`);
      setChatMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setChatInput('');
    try {
      await api.post(`/groups/${groupId}/messages`, { message: trimmed });
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }

  async function handleLeaveGroup() {
    const confirmed = window.confirm('Are you sure you want to leave this group?');
    if (!confirmed) return;

    setLeaving(true);
    setError('');
    try {
      await api.delete(`/groups/${groupId}/leave`);
      navigate('/groups');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave group');
      setLeaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-9 bg-gray-200 rounded-lg w-64 mb-8"></div>
          <div className="bg-white rounded-2xl h-56"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">

        <button
          onClick={() => navigate('/groups')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Groups
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Group #{groupId}</h1>
          <span className="text-sm text-gray-400">{members.length} members</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">Leaderboard</h2>
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => {
              const medal = getMedalStyle(idx);
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.06, 0.4) }}
                  className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: medal.bg, color: medal.text }}
                    >
                      {entry.rank}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{entry.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Flame size={12} className="text-orange-500" /> {entry.current_streak} day streak
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm" style={{ color: '#0F6E56' }}>
                    <CountUp value={entry.total_points} /> pts
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Group chat */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-4 flex flex-col h-[420px]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <MessageCircle size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Group Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-sm text-gray-400">No messages yet. Say hey to your group!</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.user_id === currentUser?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMe && (
                        <span className="text-xs text-gray-400 mb-1 px-1">{msg.sender_name}</span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={sending || !chatInput.trim()}
              className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50 flex-shrink-0"
            >
              <Send size={16} />
            </motion.button>
          </form>
        </div>

        <button
          onClick={handleLeaveGroup}
          disabled={leaving}
          className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
          <LogOut size={15} />
          {leaving ? 'Leaving...' : 'Leave this group'}
        </button>

      </div>
    </div>
  );
}

export default GroupDetail;