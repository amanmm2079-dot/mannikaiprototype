import React from 'react';
import { 
  Users, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AtrocityCase, User, UserRole } from '../types';
import { AppStore } from '../services/storage';

interface RoleSwitcherBarProps {
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
  onSelectCase: (caseId: string) => void;
  activeCaseId?: string;
  cases: AtrocityCase[];
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  onSelectRole,
  onSelectCase,
  activeCaseId,
  cases,
}) => {
  const handleReset = () => {
    if (window.confirm('Reset all synthetic demo cases to default initial state?')) {
      AppStore.resetDemoData();
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'victim': return { label: 'Victim / Complainant', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'counsellor': return { label: 'Certified Counsellor', color: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'district_officer':
      case 'caseworker': return { label: 'District Welfare Officer', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'state_admin': return { label: 'State Administrator', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'national_admin': return { label: 'National Administrator', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'auditor':
      case 'sys_admin': return { label: 'System Auditor', color: 'bg-stone-200 text-stone-800 border-stone-400' };
      default: return { label: 'Authorized User', color: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);

  return (
    <aside aria-label="Demo Role & Scenario Navigator" className="bg-stone-100 border-b border-stone-200 px-4 py-2.5 text-xs text-stone-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* User Identity & Active Role */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
            Demo Environment:
          </span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${currentBadge.color}`}>
            {currentBadge.label}
          </span>
          <span className="text-stone-900 font-medium">
            {currentUser.name}
          </span>
          {currentUser.district && (
            <span className="text-stone-500 text-[11px]">
              ({currentUser.district}, {currentUser.state})
            </span>
          )}
        </div>

        {/* Demo Scenario Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-stone-500 text-[11px] font-medium mr-1 hidden lg:inline">
            Load Scenario:
          </span>
          
          <button
            onClick={() => onSelectCase('CASE-MH-2026-109')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
              activeCaseId === 'CASE-MH-2026-109' 
                ? 'bg-rose-700 text-white border-rose-800 shadow-sm' 
                : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
            }`}
            title="Load Acute Escalation Spike (Sunita D., 9.1/10)"
          >
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            <span>Acute Crisis (9.1)</span>
          </button>

          <button
            onClick={() => onSelectCase('CASE-MH-2026-042')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
              activeCaseId === 'CASE-MH-2026-042' 
                ? 'bg-amber-700 text-white border-amber-800 shadow-sm' 
                : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
            }`}
            title="Load Gradual Distress Escalation (Ramesh K., 6.8/10)"
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Gradual Rise (6.8)</span>
          </button>

          <button
            onClick={() => onSelectCase('CASE-MH-2026-001')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
              activeCaseId === 'CASE-MH-2026-001' 
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm' 
                : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
            }`}
            title="Load Stable Case (Pooja R., 2.2/10)"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Stable Low (2.2)</span>
          </button>

          <button
            onClick={() => onSelectCase('CASE-RJ-2026-088')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
              activeCaseId === 'CASE-RJ-2026-088' 
                ? 'bg-orange-700 text-white border-orange-800 shadow-sm' 
                : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
            }`}
            title="Load 3 Missed Check-ins Case (Vikram S.)"
          >
            <span>Missed Check-ins (3)</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1 text-stone-500 hover:text-stone-800 hover:bg-white rounded transition-colors ml-1"
            title="Reset synthetic data to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
