import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Users,
  Trophy,
  Settings,
  Cpu,
  LogOut,
  Shield,
} from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: BookOpen, label: 'Curriculum', to: '/curriculum' },
  { icon: Code2, label: 'Practice', to: '/practice' },
  { icon: Trophy, label: 'Contests', to: '/contests' },
  { icon: Users, label: 'Community', to: '/community' },
  { icon: Shield, label: 'Admin Panel', to: '/admin', adminOnly: true },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export default function Sidebar() {
  const { user, logout } = useGlobal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0d0d0f] border-r border-white/5 flex flex-col z-40">
      <div className="px-5 py-5 border-b border-white/5">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
            <Cpu size={16} className="text-sky-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">CP Tracker</p>
            <p className="text-[10px] text-white/30 mt-0.5">Project L-X1</p>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 py-1.5 text-[10px] font-semibold text-white/20 uppercase tracking-widest">Main</p>
        {navItems
          .filter((item) => !item.adminOnly || user?.role === 'admin')
          .map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon size={15} className="text-current" />
              <span className="flex-1 text-left font-medium">{label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/5">
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white">
              {user.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">{user.username}</p>
              <p className="text-[10px] text-white/25 truncate">{user.role === 'admin' ? 'Admin' : 'User'}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-md text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Log out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors">
            <LogOut size={12} /> Sign in
          </NavLink>
        )}
      </div>
    </aside>
  );
}
