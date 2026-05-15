import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobal } from '../contexts/GlobalContext';
import { Cpu } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useGlobal();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const err = login(username, password);
    if (err) setError(err);
    else navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
            <Cpu size={20} className="text-sky-400" />
          </div>
          <span className="text-lg font-bold text-white">CP Tracker</span>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#111114] p-6">
          <h1 className="text-xl font-bold text-white text-center mb-1">Welcome back</h1>
          <p className="text-sm text-white/30 text-center mb-6">Sign in to continue</p>
          {error && <div className="mb-4 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-sky-500/40 transition-colors"
                placeholder="Enter username" autoFocus />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-sky-500/40 transition-colors"
                placeholder="Enter password" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-sm font-semibold text-white transition-colors">Sign In</button>
          </form>
          <p className="text-xs text-white/25 text-center mt-5">
            Don&apos;t have an account? <Link to="/signup" className="text-sky-400 hover:text-sky-300 transition-colors">Sign up</Link>
          </p>
        </div>
        <p className="text-[10px] text-white/15 text-center mt-4">Demo: admin / 123 (admin) &middot; user / 123 (user)</p>
      </div>
    </div>
  );
}
