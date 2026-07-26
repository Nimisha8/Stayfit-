import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { User, Lock, Ruler, LogOut, Calendar, AlertTriangle, Scale,Target , HeartPulse} from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user'));

  const [name, setName] = useState(storedUser?.name || '');
  const [nameMsg, setNameMsg] = useState('');
  const [nameError, setNameError] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [height, setHeight] = useState('');
  const [heightMsg, setHeightMsg] = useState('');
  const [heightError, setHeightError] = useState('');
  const [savingHeight, setSavingHeight] = useState(false);

const [goals, setGoals] = useState('');
  const [goalsMsg, setGoalsMsg] = useState('');
  const [goalsError, setGoalsError] = useState('');
  const [savingGoals, setSavingGoals] = useState(false);

  const [healthConditions, setHealthConditions] = useState([]);
  const [healthOther, setHealthOther] = useState('');
  const [savingHealth, setSavingHealth] = useState(false);
  const [healthMsg, setHealthMsg] = useState('');

  const [unit, setUnit] = useState('kg');
  const [savingUnit, setSavingUnit] = useState(false);
  const [unitMsg, setUnitMsg] = useState('');

  const [overview, setOverview] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.user?.height_cm) {
        setHeight(res.data.user.height_cm);
      }
      setUnit(res.data.user?.unit_preference || 'kg');
      setGoals(res.data.user?.goals || '');

      try {
        const saved = JSON.parse(res.data.user?.health_conditions || '{}');
        setHealthConditions(saved.conditions || []);
        setHealthOther(saved.other || '');
      } catch {
        // no health info saved yet — leave defaults
      }

    } catch (err) {
      console.error('Error loading profile:', err);
    }

    try {
      const overviewRes = await api.get('/auth/account-overview');
      setOverview(overviewRes.data);
    } catch (err) {
      console.error('Error loading account overview:', err);
    }
  }

  async function handleNameSubmit(e) {
    e.preventDefault();
    setSavingName(true);
    setNameMsg('');
    setNameError('');
    try {
      const res = await api.put('/auth/profile', { name });
      const updatedUser = { ...storedUser, name: res.data.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setNameMsg('Name updated successfully!');
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg('');
    setPasswordError('');
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleHeightSubmit(e) {
    e.preventDefault();
    setSavingHeight(true);
    setHeightMsg('');
    setHeightError('');
    try {
      await api.put('/auth/height', { height_cm: parseFloat(height) });
      setHeightMsg('Height saved! Check your Progress page for BMI.');
    } catch (err) {
      setHeightError(err.response?.data?.message || 'Failed to save height');
    } finally {
      setSavingHeight(false);
    }
  }
async function handleGoalsSubmit(e) {
    e.preventDefault();
    setSavingGoals(true);
    setGoalsMsg('');
    setGoalsError('');
    try {
      await api.put('/auth/goals', { goals });
      setGoalsMsg('Saved!');
    } catch (err) {
      setGoalsError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSavingGoals(false);
    }
  }
  const COMMON_CONDITIONS = ['Thyroid', 'Diabetes', 'PCOS / PCOD', 'High Blood Pressure', 'Heart Condition'];

  function toggleCondition(condition) {
    setHealthConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  }

  async function handleHealthSubmit(e) {
    e.preventDefault();
    setSavingHealth(true);
    setHealthMsg('');
    try {
      const payload = JSON.stringify({ conditions: healthConditions, other: healthOther });
      await api.put('/auth/health-info', { health_conditions: payload });
      setHealthMsg('Saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingHealth(false);
    }
  }
  async function handleUnitChange(newUnit) {
    if (newUnit === unit) return;
    setSavingUnit(true);
    setUnitMsg('');
    try {
      await api.put('/auth/unit-preference', { unit_preference: newUnit });
      setUnit(newUnit);
      setUnitMsg('Preference saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUnit(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account details.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          {/* Update name */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <User size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Your Name</h2>
            </div>
            <form onSubmit={handleNameSubmit} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              {nameMsg && <p className="text-emerald-600 text-xs font-medium">{nameMsg}</p>}
              {nameError && <p className="text-red-600 text-xs font-medium">{nameError}</p>}
              <button
                type="submit"
                disabled={savingName}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {savingName ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
{/* Your goals */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Target size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Your Goals</h2>
            </div>
            <form onSubmit={handleGoalsSubmit} className="space-y-3">
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="What do you want to achieve? What changes are you working toward?"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {goalsMsg && <p className="text-emerald-600 text-xs font-medium">{goalsMsg}</p>}
              {goalsError && <p className="text-red-600 text-xs font-medium">{goalsError}</p>}
              <button
                type="submit"
                disabled={savingGoals}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {savingGoals ? 'Saving...' : 'Save Goals'}
              </button>
            </form>
          </div>
          {/* Health information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-red-50 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center">
                <HeartPulse size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Health Information</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Optional and just for your own reference — this isn't used anywhere else in the app and isn't a substitute for medical advice.
            </p>
            <form onSubmit={handleHealthSubmit} className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((condition) => (
                  <button
                    type="button"
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      healthConditions.includes(condition)
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={healthOther}
                onChange={(e) => setHealthOther(e.target.value)}
                placeholder="Anything else? (optional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {healthMsg && <p className="text-emerald-600 text-xs font-medium">{healthMsg}</p>}
              <button
                type="submit"
                disabled={savingHealth}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {savingHealth ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-50 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center">
                <Lock size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              {passwordMsg && <p className="text-emerald-600 text-xs font-medium">{passwordMsg}</p>}
              {passwordError && <p className="text-red-600 text-xs font-medium">{passwordError}</p>}
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {savingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Height (for BMI) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-50 text-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Ruler size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Height</h2>
            </div>
            <form onSubmit={handleHeightSubmit} className="space-y-3">
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Height in cm (e.g. 170)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-400">Used to calculate your BMI on the Progress page.</p>
              {heightMsg && <p className="text-emerald-600 text-xs font-medium">{heightMsg}</p>}
              {heightError && <p className="text-red-600 text-xs font-medium">{heightError}</p>}
              <button
                type="submit"
                disabled={savingHeight}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {savingHeight ? 'Saving...' : 'Save Height'}
              </button>
            </form>
          </div>

          {/* Weight units (merged from Settings) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Scale size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Weight Units</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Your data is always stored in kilograms — this only changes what's displayed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleUnitChange('kg')}
                disabled={savingUnit}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                  unit === 'kg' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                onClick={() => handleUnitChange('lbs')}
                disabled={savingUnit}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                  unit === 'lbs' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
            {unitMsg && <p className="text-emerald-600 text-xs font-medium mt-3">{unitMsg}</p>}
          </div>

          {/* Account overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Account Overview</h2>
            </div>
            {overview ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(overview.memberSince).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total check-ins</span>
                  <span className="font-medium text-gray-900">{overview.totalCheckins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Longest streak ever</span>
                  <span className="font-medium text-gray-900">{overview.longestStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Groups joined</span>
                  <span className="font-medium text-gray-900">{overview.groupsJoined}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Loading...</p>
            )}
          </div>

          {/* Logout */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-100 text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <LogOut size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Log Out</h2>
            </div>
            <p className="text-xs text-gray-400 mb-auto">
              You'll need to log back in to access your account again.
            </p>
            <button
              onClick={handleLogout}
              className="w-full mt-4 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
            >
              Log Out
            </button>
          </div>

          {/* Delete account */}
          <div className="bg-white rounded-2xl border border-red-200 p-5 sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-50 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
              <h2 className="font-semibold text-gray-900">Delete Account</h2>
            </div>

            {!showDeleteConfirm ? (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  Permanently delete your account and all associated data — check-ins, streaks, progress, photos, and group memberships. This cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                >
                  Delete My Account
                </button>
              </>
            ) : (
              <form onSubmit={handleDeleteAccount} className="space-y-3 max-w-sm">
                <p className="text-sm text-gray-700 font-medium">
                  Enter your password to confirm permanent deletion.
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                {deleteError && <p className="text-red-600 text-xs font-medium">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={deleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;