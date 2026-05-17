import React from 'react';
import { cn } from '@/lib/utils';
import { Badge as LucideBadge, Home, LineChart, ShieldAlert, Cpu, Bot, Menu, Search, X, Activity, Wrench, DollarSign, Network, Building2 } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'sales', label: 'Sales Analytics', icon: LineChart },
  { id: 'quality', label: 'Quality Analytics', icon: ShieldAlert },
  { id: 'bridge', label: 'Bridge & Quadrants', icon: LucideBadge },
  { id: 'rootcause', label: 'Root Cause Analysis', icon: Network },
  { id: 'model', label: 'Defect Prediction', icon: Cpu },
  { id: 'live', label: 'Live IoT Stream', icon: Activity },
  { id: 'maintenance', label: 'Predictive Maint.', icon: Wrench },
  { id: 'yield', label: 'Yield Management', icon: DollarSign },
  { id: 'enterprise', label: 'Enterprise Hub', icon: Building2 },
  { id: 'copilot', label: 'AI Copilot', icon: Bot },
];

export function Sidebar({ currentView, onViewChange, isMobileOpen, setMobileOpen }: SidebarProps) {
  const content = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-400 font-medium border-r border-slate-800">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-100">
          <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 font-bold text-white text-sm">
            SC
          </div>
          <span className="font-bold tracking-tight hidden md:block lg:block whitespace-nowrap overflow-hidden text-ellipsis w-full uppercase">Analytics</span>
        </div>
        <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(false)}>
          <X className="size-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-1.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold",
                currentView === item.id 
                  ? "bg-slate-800 text-slate-100" 
                  : "hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-slate-800 shrink-0 flex items-center justify-center font-bold text-slate-300 text-sm">AD</div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-semibold text-slate-100 truncate">Admin User</span>
            <span className="text-[10px] text-slate-500 truncate">Global Controller</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div className={cn("fixed inset-0 z-50 bg-black/50 md:hidden transition-opacity", isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setMobileOpen(false)} />
      <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 transform transition-transform md:translate-x-0 md:static md:w-64 shrink-0", isMobileOpen ? "translate-x-0" : "-translate-x-full")}>
        {content}
      </div>
    </>
  );
}
