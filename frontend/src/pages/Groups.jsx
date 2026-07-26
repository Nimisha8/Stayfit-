import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Plus, LogIn, ChevronRight, Users2 } from 'lucide-react';

// Rotating avatar colors for group initials — not tied to any specific meaning,
// just gives each group a distinct, recognizable identity in the list. Pulled
// from the same bold palette used across Dashboard/Progress/Leaderboard.
const avatarPalette = ['#3B6D11', '#0F6E56', '#085041', '#185FA5', '#534AB7'];
function getAvatarColor(id) {
  return avatarPalette[id % avatarPalette.length];
}

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const [joinGroupId, setJoinGroupId] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const res = await api.get('/groups/my-groups');
      setGroups(res.data.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/groups', { name: newGroupName });
      setNewGroupName('');
      await loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinGroup(e) {
    e.preventDefault();
    setJoining(true);
    setError('');
    try {
      await api.post(`/groups/${joinGroupId}/join`);
      setJoinGroupId('');
      await loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-500 mt-1">Team up for extra accountability.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Create group */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Plus size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Create a Group</h2>
            </div>
            <form onSubmit={handleCreateGroup} className="flex gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={creating}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap"
              >
                {creating ? '...' : 'Create'}
              </motion.button>
            </form>
          </motion.div>

          {/* Join group */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-emerald-50 text-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <LogIn size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Join a Group</h2>
            </div>
            <form onSubmit={handleJoinGroup} className="flex gap-2">
              <input
                type="number"
                value={joinGroupId}
                onChange={(e) => setJoinGroupId(e.target.value)}
                placeholder="Group ID"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={joining}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 whitespace-nowrap"
              >
                {joining ? '...' : 'Join'}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Group list */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Your Groups</h2>

          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="bg-gray-100 rounded-xl h-14"></div>
              <div className="bg-gray-100 rounded-xl h-14"></div>
              <div className="bg-gray-100 rounded-xl h-14"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-10">
              <Users2 className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="text-gray-500 text-sm">You haven't joined any groups yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group, idx) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                  whileHover={{ x: 4 }}
                >
                  <Link
                    to={`/groups/${group.id}`}
                    className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm text-white"
                        style={{ backgroundColor: getAvatarColor(group.id) }}
                      >
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{group.name}</p>
                        <p className="text-xs text-gray-400">Group #{group.id}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Groups;