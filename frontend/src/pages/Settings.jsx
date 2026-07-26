import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Scale } from 'lucide-react';

function Settings() {
  const [unit, setUnit] = useState('kg');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await api.get('/auth/profile');
      setUnit(res.data.user?.unit_preference || 'kg');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnitChange(newUnit) {
    if (newUnit === unit) return;
    setSaving(true);
    setMsg('');
    try {
      await api.put('/auth/unit-preference', { unit_preference: newUnit });
      setUnit(newUnit);
      setMsg('Preference saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-9 bg-gray-200 rounded-lg w-48 mb-8"></div>
          <div className="bg-white rounded-2xl h-40"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Customize how the app works for you.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <Scale size={16} />
            </div>
            <h2 className="font-semibold text-gray-900">Weight Units</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Choose how weight is displayed across the app. Your data is always stored safely in kilograms — this only changes what you see.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleUnitChange('kg')}
              disabled={saving}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                unit === 'kg' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Kilograms (kg)
            </button>
            <button
              onClick={() => handleUnitChange('lbs')}
              disabled={saving}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                unit === 'lbs' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pounds (lbs)
            </button>
          </div>
          {msg && <p className="text-emerald-600 text-xs font-medium mt-3">{msg}</p>}
        </div>
      </div>
    </div>
  );
}

export default Settings;