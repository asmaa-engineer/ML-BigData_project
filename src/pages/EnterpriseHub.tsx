import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Building2, Users, Zap, FileText, Webhook, CreditCard, 
  ShieldCheck, Plus, CheckCircle2, Search, ArrowRight, Link as LinkIcon, Key, Download, ToggleRight, BarChart 
} from 'lucide-react';
import type { ActionLogEntry } from '@/lib/contracts';
import { fetchActionLogs } from '@/services/aiService';

export default function EnterpriseHubView() {
  const [activeTab, setActiveTab] = useState('automations');
  const [actionLogs, setActionLogs] = useState<ActionLogEntry[]>([]);

  useEffect(() => {
    void fetchActionLogs()
      .then(setActionLogs)
      .catch(() => setActionLogs([]));
  }, []);

  const tabs = [
    { id: 'automations', label: 'Automations & Alerts', icon: Zap },
    { id: 'integrations', label: 'ERP & Integrations', icon: Webhook },
    { id: 'reports', label: 'Scheduled Reports', icon: FileText },
    { id: 'team', label: 'Team & RBAC', icon: Users },
    { id: 'billing', label: 'Billing & Quotas', icon: CreditCard },
    { id: 'audit', label: 'Security & Audit Logs', icon: ShieldCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'automations':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Rule Engine & Automations</h3>
                <p className="text-sm text-slate-400">Configure trigger-based actions and alerts.</p>
              </div>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                <Plus className="size-4" /> Create Rule
              </button>
            </div>
            
            {[
              { name: 'Critical Thermal Alert', trigger: 'If Line Alpha Temp > 85°C', action: 'Slack #maintenance & PagerDuty', status: 'Active' },
              { name: 'High Defect Rate Halt', trigger: 'If Defect Rate > 15% (1h window)', action: 'SAP ERP: Pause WIP Order', status: 'Active' },
              { name: 'Daily Yield Summary', trigger: 'Every day at 18:00', action: 'Email: floor-managers@company.com', status: 'Paused' },
            ].map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-colors">
                <div>
                  <h4 className="font-bold text-slate-200">{rule.name}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">IF: {rule.trigger}</span>
                    <ArrowRight className="size-3 text-slate-500" />
                    <span className="text-indigo-300 font-mono bg-indigo-900/30 px-2 py-1 rounded">THEN: {rule.action}</span>
                  </div>
                </div>
                <ToggleRight className={`size-8 ${rule.status === 'Active' ? 'text-emerald-500' : 'text-slate-600'}`} />
              </div>
            ))}
          </div>
        );
      case 'integrations':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Integrations & API</h3>
                <p className="text-sm text-slate-400">Connect to your existing Enterprise software stack.</p>
              </div>
              <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-600">
                <Key className="size-4" /> Generate API Key
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'SAP S/4HANA', desc: 'Sync production orders and material ledgers.', status: 'Connected', color: 'blue' },
                { name: 'Salesforce', desc: 'Link quality events to customer CRM records.', status: 'Connect', color: 'sky' },
                { name: 'Slack', desc: 'Send real-time ML anomaly alerts to channels.', status: 'Connected', color: 'emerald' },
                { name: 'Custom Webhooks', desc: 'Forward IoT telemetry data to HTTP endpoints.', status: 'Configure', color: 'indigo' },
              ].map((int, i) => (
                <div key={i} className="p-5 bg-slate-900 border border-slate-700/50 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg bg-${int.color}-500/10 text-${int.color}-400`}>
                      <LinkIcon className="size-6" />
                    </div>
                    {int.status === 'Connected' ? (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        <CheckCircle2 className="size-3" /> Connected
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{int.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-4">{int.desc}</p>
                    <button className={`w-full py-2 text-xs font-bold rounded-lg transition-colors border ${int.status === 'Connected' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'}`}>
                      {int.status === 'Connected' ? 'Manage Settings' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Team & Access Control</h3>
                <p className="text-sm text-slate-400">Manage users and Role-Based Access Control (RBAC).</p>
              </div>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                <Users className="size-4" /> Invite User
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-700/50 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    { name: 'Sarah Connor', email: 'sarah@company.com', role: 'Admin', active: 'Just now' },
                    { name: 'John Doe', email: 'john.d@company.com', role: 'Machine Operator', active: '2h ago' },
                    { name: 'Alice Smith', email: 'alice.s@company.com', role: 'Data Analyst', active: '1d ago' },
                  ].map((user, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-800 text-indigo-300 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{user.active}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-slate-500 hover:text-slate-300 text-xs font-semibold">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
             <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-100">Billing & Usage Quotas</h3>
                <p className="text-sm text-slate-400">Current plan: Enterprise Tier ($1,299/mo)</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-400">API Requests</p>
                     <p className="text-xs text-slate-500">820k / 1M</p>
                   </div>
                   <div className="w-full bg-slate-800 rounded-full h-2">
                     <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                   </div>
                </div>
                <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Copilot Inference</p>
                     <p className="text-xs text-slate-500">4,120 / 10,000</p>
                   </div>
                   <div className="w-full bg-slate-800 rounded-full h-2">
                     <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '41%' }}></div>
                   </div>
                </div>
             </div>

             <Card className="bg-indigo-950/20 border-indigo-500/20 shadow-none">
               <CardContent className="flex items-center justify-between p-6">
                 <div>
                   <h4 className="font-bold text-indigo-300 text-lg">Scale your infrastructure</h4>
                   <p className="text-sm text-indigo-200/70 mt-1 max-w-sm">Need higher API limits and priority ML processing queues? Contact your account manager.</p>
                 </div>
                 <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors">
                   Request Upgrade
                 </button>
               </CardContent>
             </Card>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Automated PDF Reports</h3>
                <p className="text-sm text-slate-400">Schedule and download recurring analytics reports.</p>
              </div>
              <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                <Plus className="size-4" /> New Report
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[
                 { title: 'Weekly Quality Summary', type: 'PDF • Weekly', emails: '2 recipients' },
                 { title: 'Yield & Pricing Adjustments', type: 'CSV • Daily', emails: '1 recipient' },
                 { title: 'Raw Sensor Data Export', type: 'Parquet • Monthly', emails: 'Data Warehouse' },
               ].map((rep, i) => (
                 <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 text-center flex flex-col items-center">
                    <div className="p-3 bg-slate-800 rounded-full text-indigo-400 mb-3 border border-slate-700">
                      <BarChart className="size-6" />
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm mb-1">{rep.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">{rep.type} • {rep.emails}</p>
                    <button className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded flex-shrink-0 transition-colors">
                      <Download className="size-3" /> Download Latest
                    </button>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'audit':
        return (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-100">Security & Audit Trail</h3>
              <p className="text-sm text-slate-400">Immutable log of system changes and data access.</p>
            </div>
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl max-h-[500px] overflow-y-auto p-4 space-y-4">
               {actionLogs.length === 0 ? (
                 <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-500">
                   No runtime action logs yet. Apply a pricing action or trigger an automated event to populate this feed.
                 </div>
               ) : actionLogs.map((log) => (
                 <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/50 last:border-0 last:pb-0">
                   <div>
                     <p className="text-sm font-semibold text-slate-300">{log.action}</p>
                     <p className="text-xs text-slate-500">{log.area.toUpperCase()} • {log.target}</p>
                     <p className="text-xs text-slate-400 mt-1">{log.detail}</p>
                   </div>
                   <p className="text-xs text-slate-500 mt-2 md:mt-0 font-mono">{new Date(log.createdAt).toLocaleString()}</p>
                 </div>
               ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="shrink-0">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="size-6 text-indigo-400" />
            Enterprise Hub & Configurations
        </h2>
        <p className="text-xs text-slate-400 mt-1">Manage automations, API integrations, billing, and team access rules.</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1 overflow-y-auto pr-2">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                 activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
               }`}
             >
               <tab.icon className={`size-4 ${activeTab === tab.id ? 'text-indigo-200' : ''}`} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <Card className="flex-1 bg-slate-900 border-slate-800 shadow-xl overflow-y-auto">
          <CardContent className="p-6">
             {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
