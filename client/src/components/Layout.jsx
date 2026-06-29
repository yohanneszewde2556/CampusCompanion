import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import MatchNotification from './MatchNotification';
import { disconnectSocket } from '../services/socket';

const navLinks = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/lost-found', label: 'Lost & Found', end: false },
  { to: '/ai-assistant', label: 'AI Assistant', end: false },
  { to: '/marketplace', label: 'Marketplace', end: false },
  { to: '/study-groups', label: 'Study Groups', end: false },
  { to: '/announcements', label: 'Announcements', end: false },
];

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const userInfo = useSelector((state) => state.auth.userInfo);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear local state even if the server call fails
    }
    dispatch(logout());
    disconnectSocket();
    navigate('/login');
  };

  const roleLabel = userInfo?.role?.charAt(0).toUpperCase() + userInfo?.role?.slice(1);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:flex">
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Campus Companion
          </Link>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your university hub</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {['moderator', 'admin'].includes(userInfo?.role) && (
            <NavLink
              to="/claims-review"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              Review Claims
            </NavLink>
          )}
        </nav>

        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {userInfo?.firstName} {userInfo?.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo?.email}</p>
          <span className="mt-2 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {roleLabel}
          </span>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80 md:px-8">
          <div className="md:hidden">
            <Link to="/" className="text-lg font-extrabold text-gray-900 dark:text-white">
              Campus Companion
            </Link>
          </div>

          <nav className="flex gap-1 md:hidden">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:inline">
              {userInfo?.firstName}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1">
          <MatchNotification />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
