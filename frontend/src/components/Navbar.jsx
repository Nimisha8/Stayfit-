import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, Users, User, TrendingUp, Sparkles, Dumbbell, Menu, X } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Flame },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
    { label: 'Trainer', path: '/trainer', icon: Dumbbell },
    { label: 'Coach', path: '/coach', icon: Sparkles },
    { label: 'Groups', path: '/groups', icon: Users },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-16 gap-4">

          <button
            onClick={() => goTo('/dashboard')}
            className="flex items-center gap-2 font-extrabold text-lg text-gray-900 flex-shrink-0"
          >
            <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">
              <Flame size={18} />
            </div>
            StayFit
          </button>

          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition whitespace-nowrap ${
                    isActive ? 'text-indigo-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <div className="hidden xl:flex items-center gap-1.5 text-sm font-medium text-gray-700 whitespace-nowrap">
              <User size={15} className="text-gray-400" />
              {user?.name}
            </div>
          </div>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="lg:hidden text-gray-600 p-1.5"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 px-6 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => goTo(item.path)}
                className={`w-full flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg transition ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
          {user?.name && (
            <div className="pt-2 mt-2 border-t border-gray-100 text-xs text-gray-400 px-3">
              <User size={15} className="text-gray-400 inline mr-1.5" />
              Logged in as {user.name}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;