import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import Logo from '../ui/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/about', label: 'About' },
  { to: '/admission', label: 'Admission' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardPath = role === 'teacher' ? '/teacher/dashboard' : role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-ink-950/80 backdrop-blur-xl shadow-card border-b border-ink-100 dark:border-white/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-app flex h-16 lg:h-20 items-center justify-between">
        <Logo />

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-ink-600 dark:text-ink-100 hover:text-primary hover:bg-primary/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-600 dark:text-ink-100 hover:bg-ink-50 dark:hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to={dashboardPath} className="btn-outline !py-2 !px-4 text-sm">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-ghost !py-2 !px-3" aria-label="Log out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">Log in</Link>
              <Link to="/register" className="btn-primary !py-2.5 !px-5 text-sm">Get Started</Link>
            </div>
          )}
        </div>

        <button
          className="lg:hidden grid h-10 w-10 place-items-center rounded-lg text-ink-700 dark:text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-ink-100 dark:border-white/10 bg-white dark:bg-ink-950 px-4 pb-6 pt-2">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive ? 'text-primary bg-primary/10' : 'text-ink-600 dark:text-ink-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-white/10 pt-4">
            <button onClick={toggleTheme} className="btn-ghost text-sm">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            {user ? (
              <button onClick={handleLogout} className="btn-ghost text-sm text-red-500">
                <LogOut size={16} /> Log out
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost text-sm">Log in</Link>
            )}
          </div>
          {!user && (
            <Link to="/register" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full text-sm">
              Get Started
            </Link>
          )}
          {user && (
            <Link to={dashboardPath} onClick={() => setOpen(false)} className="btn-primary mt-3 w-full text-sm">
              <LayoutDashboard size={16} /> Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
