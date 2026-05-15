import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useGlobal } from '../contexts/GlobalContext';
import { Send, Users } from 'lucide-react';

export default function CommunityPage() {
  const { communityChat, sendMessage, user } = useGlobal();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [communityChat]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input?.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts: number) => {
    const d = new Date(ts); const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const messages = Array.isArray(communityChat) ? communityChat : [];

  return (
    <main className="flex-1 min-w-0 px-7 py-7 flex flex-col">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Community</h1>
        <p className="text-sm text-white/35 mt-1">Chat with fellow competitive programmers.</p>
      </div>

      <div className="flex-1 flex flex-col rounded-xl border border-white/[0.07] bg-[#111114] overflow-hidden min-h-0">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
          <Users size={15} className="text-sky-400" />
          <span className="text-xs font-semibold text-white/60">Global Chat</span>
          <span className="ml-auto text-[10px] text-white/20 tabular-nums">{messages.length} messages</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[300px] max-h-[calc(100vh-280px)]">
          {messages.length === 0 ? (
            <div className="text-center py-12"><Users size={24} className="text-white/10 mx-auto mb-3" /><p className="text-sm text-white/20">No messages yet. Be the first!</p></div>
          ) : (
            messages.map((msg, i) => {
              const isOwn = msg?.sender === user?.username;
              const showDate = i === 0 || formatDate(msg?.timestamp ?? 0) !== formatDate(messages[i - 1]?.timestamp ?? 0);
              return (
                <div key={msg?.id ?? i}>
                  {showDate && (
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[10px] text-white/15 font-medium">{formatDate(msg?.timestamp ?? 0)}</span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>
                  )}
                  <div className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      isOwn ? 'bg-gradient-to-br from-sky-500 to-cyan-400 text-white' : 'bg-white/10 text-white/50'
                    }`}>
                      {msg?.sender?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className={`text-[11px] font-semibold ${isOwn ? 'text-sky-300' : 'text-white/50'}`}>{msg?.sender ?? 'Unknown'}</span>
                        <span className="text-[9px] text-white/15">{formatTime(msg?.timestamp ?? 0)}</span>
                      </div>
                      <div className={`inline-block px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                        isOwn ? 'bg-sky-500/15 text-sky-100/90 border border-sky-500/20' : 'bg-white/5 text-white/70 border border-white/[0.07]'
                      }`}>
                        {msg?.text ?? ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/5 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={user ? 'Type a message...' : 'Sign in to chat'} disabled={!user}
            className="flex-1 bg-[#0a0a0c] border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-sky-500/40 transition-colors disabled:opacity-40" />
          <button type="submit" disabled={!user || !input?.trim()}
            className="px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors">
            <Send size={14} />
          </button>
        </form>
      </div>
    </main>
  );
}
