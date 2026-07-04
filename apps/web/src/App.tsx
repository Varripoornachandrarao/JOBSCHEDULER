export default function App() {
  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden font-sans text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/60 border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-black tracking-wider text-slate-950 text-xl shadow-lg shadow-blue-500/20">
            JS
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              JobScheduler
            </h1>
            <p className="text-xs text-slate-500 font-mono">v1.0.0-alpha</p>
          </div>
        </div>
        
        {/* System Indicator Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">PostgreSQL</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">Redis Broker</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Hero Card (Glassmorphic) */}
          <div className="lg:col-span-2 backdrop-blur-lg bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-slate-700/80 transition-all duration-300">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/10 transition-all" />
            
            <div>
              <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold mb-6">
                🚀 Phase 1: Environment Active
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Distributed Job <br />
                Scheduler Monorepo.
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg mb-8">
                Your high-throughput asynchronous job execution plane is initialized. The Express API, 
                worker services, Prisma ORM context, and Redis-backed BullMQ messaging layers are compiled and ready.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-slate-900 pt-6">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-900/60 min-w-[120px]">
                <div className="text-xs text-slate-500 font-medium font-mono">WORKSPACE</div>
                <div className="text-sm font-semibold mt-1">npm workspaces</div>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-900/60 min-w-[120px]">
                <div className="text-xs text-slate-500 font-medium font-mono">DB LAYER</div>
                <div className="text-sm font-semibold mt-1 text-emerald-400">Prisma + PG</div>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-900/60 min-w-[120px]">
                <div className="text-xs text-slate-500 font-medium font-mono">QUEUE BROKER</div>
                <div className="text-sm font-semibold mt-1 text-blue-400">BullMQ + Redis</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics / Stats Mock card */}
          <div className="backdrop-blur-lg bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 shadow-2xl flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white mb-6">Environment Checklist</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span className="text-sm text-slate-300">Express API Router</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Port 3001</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span className="text-sm text-slate-300">Worker Services</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Node TS</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span className="text-sm text-slate-300">Tailwind Styling</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</span>
                    <span className="text-sm text-slate-300">Dockerized Cluster</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Ready</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-900 pt-6">
              <div className="text-xs text-slate-500 font-mono mb-2">AWAITING COMMANDS</div>
              <div className="text-sm text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                Ready for Phase 2 integration models...
              </div>
            </div>
          </div>
          
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900/80 bg-slate-950/40 backdrop-blur-sm py-4 px-6 text-center text-xs text-slate-600 font-mono">
        Distributed Job Scheduler Architecture &bull; Designed by Google DeepMind Antigravity Pair
      </footer>
    </div>
  );
}
