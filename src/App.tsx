import React, { lazy, Suspense, useEffect, useState, startTransition } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { AlertTriangle, Database, Menu, RefreshCw, Sparkles } from 'lucide-react';
import { useAppStore } from './store';

const pageRegistry = {
  home: lazy(() => import('./pages/Home')),
  sales: lazy(() => import('./pages/Sales')),
  quality: lazy(() => import('./pages/Quality')),
  bridge: lazy(() => import('./pages/Bridge')),
  rootcause: lazy(() => import('./pages/RootCauseAnalysis')),
  model: lazy(() => import('./pages/Model')),
  live: lazy(() => import('./pages/LiveOperations')),
  maintenance: lazy(() => import('./pages/PredictiveMaintenance')),
  yield: lazy(() => import('./pages/YieldManagement')),
  enterprise: lazy(() => import('./pages/EnterpriseHub')),
  copilot: lazy(() => import('./pages/AICopilot')),
} as const;

type ViewId = keyof typeof pageRegistry;

function PageFallback() {
  return (
    <div className="h-full min-h-[320px] w-full rounded-3xl border border-slate-800 bg-slate-900/70 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="size-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Loading workspace...</p>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<ViewId>('home');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const {
    error,
    fetchData,
    isLoading,
    products,
    quality,
    readiness,
    sales,
  } = useAppStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-indigo-400">Syncing with Backend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/20 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            <AlertTriangle className="size-6" />
          </div>
          <h2 className="text-xl font-bold">Project data could not be loaded</h2>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <button
            onClick={() => void fetchData()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <RefreshCw className="size-4" />
            Retry loading
          </button>
        </div>
      </div>
    );
  }

  const totalRecords = sales.length + quality.length;
  const hasData = products.length > 0 || sales.length > 0 || quality.length > 0;
  const ActiveView = pageRegistry[currentView] ?? pageRegistry.home;

  if (!hasData) {
    return (
      <div className="h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-800 text-slate-300">
            <Database className="size-6" />
          </div>
          <h2 className="text-xl font-bold">No analytics data available</h2>
          <p className="mt-2 text-sm text-slate-400">
            Seed the database or allow the app to fall back to local demo data, then refresh.
          </p>
          <button
            onClick={() => void fetchData()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <RefreshCw className="size-4" />
            Refresh data
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    return (
      <Suspense fallback={<PageFallback />}>
        <ActiveView />
      </Suspense>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          startTransition(() => setCurrentView(view as ViewId));
        }} 
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 absolute top-0 left-0 right-0 z-10 w-full h-16">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">SC</div>
            <span className="font-bold text-sm tracking-tight uppercase">Smart Commerce</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2 text-slate-400">
            <Menu className="size-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full pt-16 md:pt-0 pb-8 px-4 md:px-8 bg-slate-950">
          <div className="max-w-6xl mx-auto w-full py-6 md:py-8 h-full flex flex-col">
            <header className="hidden md:flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">SC</div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight uppercase">Smart Commerce & Production Analytics</h1>
                  <p className="text-xs text-slate-400">
                    System Status: <span className="text-emerald-400">Operational</span> • {totalRecords.toLocaleString()} Records Synced
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-full px-3 py-1 flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>{readiness?.modelStatus ?? 'Model active'}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-full px-3 py-1 flex items-center gap-2 text-xs">
                  <Database className="size-3 text-slate-400" />
                  <span>Source: {readiness?.dataSource ?? 'unknown'}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-full px-3 py-1 flex items-center gap-2 text-xs">
                  <Sparkles className={`size-3 ${readiness?.aiStatus === 'ready' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span>AI: {readiness?.aiStatus === 'ready' ? 'Gemini ready' : 'Fallback mode'}</span>
                </div>
              </div>
            </header>
            <div className="flex-1">
              {renderView()}
            </div>
            {/* Footer */}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 shrink-0">
              <p>© {new Date().getFullYear()} Smart Commerce Inc. All rights reserved. Last sync: {readiness ? new Date(readiness.lastSync).toLocaleString() : 'n/a'}.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
