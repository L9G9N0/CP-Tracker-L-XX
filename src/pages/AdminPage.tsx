import { useGlobal } from '../contexts/GlobalContext';

export default function AdminPage() {
  const { curriculum } = useGlobal();

  return (
    <main className="flex-1 min-w-0 px-7 py-7">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
        <p className="text-sm text-white/35 mt-1">View all curriculum data. To add or remove problems, edit <code className="text-sky-400/80 bg-sky-500/10 px-1.5 py-0.5 rounded text-xs">src/data/curriculumData.js</code></p>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-sky-500/5 p-4 mb-6">
        <p className="text-xs text-sky-300/80">
          The curriculum is now driven by <code className="text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded text-xs">curriculumData.js</code> — the single source of truth.
          Add tiers, sub-categories, and problems directly in that file. The app reloads it on every fresh visit.
          Progress (which problems you&apos;ve solved) is still saved in localStorage.
        </p>
      </div>

      {/* Data table */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111114] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80">All Problems</h2>
          <span className="text-[11px] text-white/25 tabular-nums">
            {(curriculum ?? []).reduce((s, t) => s + (t?.subCategories ?? []).reduce((ss, sub) => ss + (sub?.problems ?? []).length, 0), 0)} total
          </span>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#111114] z-10">
              <tr className="border-b border-white/5 text-[10px] text-white/25 uppercase tracking-widest font-semibold">
                <th className="text-left px-5 py-3">Tier</th>
                <th className="text-left px-5 py-3">Sub-Category</th>
                <th className="text-left px-5 py-3">Problem</th>
                <th className="text-left px-5 py-3">CF ID</th>
                <th className="text-right px-5 py-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {(curriculum ?? []).length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-white/20">No curriculum data found.</td></tr>
              )}
              {(curriculum ?? []).flatMap((tier) =>
                (tier?.subCategories ?? []).flatMap((sub) =>
                  (sub?.problems ?? []).length === 0 ? (
                    <tr key={`${tier?.tier}|${sub?.name}`} className="border-b border-white/[0.03]">
                      <td className="px-5 py-2.5 text-white/50">{tier?.tier ?? ''}</td>
                      <td className="px-5 py-2.5 text-white/40">{sub?.name ?? ''}</td>
                      <td className="px-5 py-2.5 text-white/20 italic">No problems</td>
                      <td className="px-5 py-2.5">—</td>
                      <td className="px-5 py-2.5 text-right">—</td>
                    </tr>
                  ) : (
                    (sub?.problems ?? []).map((problem) => {
                      const delKey = `${tier?.tier}|${sub?.name}|${problem?.id}`;
                      return (
                        <tr key={delKey} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-2.5 text-white/50">{tier?.tier ?? ''}</td>
                          <td className="px-5 py-2.5 text-white/40">{sub?.name ?? ''}</td>
                          <td className="px-5 py-2.5 text-white/60">{problem?.name ?? 'Unknown'}</td>
                          <td className="px-5 py-2.5"><span className="text-[11px] text-sky-400/60 font-mono">{problem?.id ?? ''}</span></td>
                          <td className="px-5 py-2.5 text-right">
                            {problem?.url ? (
                              <a href={problem.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-sky-400 hover:text-sky-300 transition-colors">Open</a>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
