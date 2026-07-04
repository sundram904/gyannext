import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, Bell } from 'lucide-react';
import Logo from '../ui/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ links, roleLabel }) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Logo />
        <span className="mt-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
          {roleLabel}
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-gradient text-white shadow-glow'
                  : 'text-ink-600 dark:text-ink-100 hover:bg-primary/5 hover:text-primary'
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-100 dark:border-white/10 p-4">
        <button onClick={handleLogout} className="btn-ghost w-full justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-ink-100 dark:lg:border-white/10 lg:bg-white dark:lg:bg-ink-900/40">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-ink-900 shadow-xl">
            <button className="absolute right-4 top-6 text-ink-500" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 dark:border-white/10 bg-white/80 dark:bg-ink-950/80 backdrop-blur-xl px-4 lg:px-8">
          <button className="lg:hidden text-ink-700 dark:text-white" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-ink-400">Welcome back,</p>
            <p className="font-display font-semibold text-ink-900 dark:text-white">{profile?.name || 'there'} 👋</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-ink-50 dark:hover:bg-white/10">
              <Bell size={18} className="text-ink-600 dark:text-ink-100" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary" />
            </button>
            <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink-50 dark:hover:bg-white/10">
              {theme === 'dark' ? <Sun size={18} className="text-ink-100" /> : <Moon size={18} className="text-ink-600" />}
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
