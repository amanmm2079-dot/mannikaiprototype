import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  UserCheck, 
  PhoneCall, 
  Wifi, 
  WifiOff, 
  Menu, 
  X, 
  RefreshCw, 
  Lock,
  HeartHandshake,
  Key,
  LogOut,
  EyeOff,
  Scale,
  Sparkles
} from 'lucide-react';
import { LanguageCode, User, UserRole } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../services/i18n';
import { AppStore } from '../services/storage';

interface AppHeaderProps {
  currentUser: User;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenGrounding?: () => void;
  onOpenExercises?: () => void;
  onOpenRights?: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onToggleCamouflage?: () => void;
  isOffline: boolean;
  offlineQueueCount: number;
  onSyncOffline: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  currentLanguage,
  onLanguageChange,
  onOpenGrounding,
  onOpenExercises,
  onOpenRights,
  onOpenLogin,
  onLogout,
  onToggleCamouflage,
  isOffline,
  offlineQueueCount,
  onSyncOffline,
  activeView,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const roleTitles: Record<UserRole, string> = {
    victim: 'Survivor',
    counsellor: 'Counsellor',
    district_officer: 'Welfare Officer',
    caseworker: 'Welfare Officer',
    state_admin: 'State Admin',
    national_admin: 'National Admin',
    auditor: 'System Auditor',
    sys_admin: 'System Auditor',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Privacy & Security Micro Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex items-center gap-1 text-teal-400 font-semibold">
            <Lock className="w-3 h-3" />
            <span>DPDP 2023 Compliant</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline text-[11px] truncate">
            AI-Powered Dynamic Distress Monitoring & Human Intervention System
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Stealth / Camouflage button for victim safety */}
          {onToggleCamouflage && currentUser.role === 'victim' && (
            <button
              onClick={onToggleCamouflage}
              className="flex items-center gap-1 text-slate-300 hover:text-white text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
              title="Quick Discretion Camouflage (Hides screen instantly)"
            >
              <EyeOff className="w-3 h-3 text-amber-400" />
              <span>Safe Screen</span>
            </button>
          )}

          {isOffline ? (
            <button 
              onClick={onSyncOffline}
              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 text-[11px] cursor-pointer"
              title="Click to sync offline entries"
            >
              <WifiOff className="w-3 h-3 animate-pulse" />
              <span>Offline ({offlineQueueCount} queued)</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 text-slate-400 text-[11px]">
              <Wifi className="w-3 h-3 text-teal-400" />
              <span className="hidden sm:inline">Encrypted Node</span>
            </span>
          )}

          <a 
            href="tel:181" 
            className="flex items-center gap-1 text-rose-300 font-semibold hover:text-rose-200 text-[11px] bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60"
            title="Emergency National Helpline"
          >
            <PhoneCall className="w-3 h-3" />
            <span>SOS 181</span>
          </a>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-white flex items-center justify-center font-display font-bold text-lg shadow-xs group-hover:scale-105 transition-all">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg text-slate-900 tracking-tight">Mannik AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  CARE CORE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5 font-medium">
                Dynamic Distress & Human Intervention
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean text links with soft colored active states) */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <button 
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'home' 
                ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200/80 shadow-2xs' 
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('victim')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'victim' 
                ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200/80 shadow-2xs' 
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Check-In Hub
          </button>
          <button 
            onClick={onOpenExercises}
            className="px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-emerald-800 hover:bg-emerald-50/70 font-semibold"
          >
            Somatic Exercises
          </button>
          <button 
            onClick={onOpenRights}
            className="px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:text-slate-900 hover:bg-slate-50"
          >
            Legal Rights
          </button>
          <button 
            onClick={() => onNavigate('counsellor')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'counsellor' 
                ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200/80 shadow-2xs' 
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Counsellor Review
          </button>
          <button 
            onClick={() => onNavigate('district')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'district' 
                ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200/80 shadow-2xs' 
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            District Welfare
          </button>
          <button 
            onClick={() => onNavigate('national')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'national' 
                ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200/80 shadow-2xs' 
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            National Analytics
          </button>
          <button 
            onClick={() => onNavigate('admin')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'admin' 
                ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200/80 shadow-2xs' 
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Admin
          </button>
        </nav>

        {/* Zone 3: Interactive Controls (Language, Grounding, Auth / Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Grounding / Shanti Quick Trigger */}
          {onOpenGrounding && (
            <button
              onClick={onOpenGrounding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/80 text-teal-800 hover:bg-teal-100 text-xs font-semibold border border-teal-200 transition-colors cursor-pointer shadow-2xs"
              title="Open Grounding & Breathing Space"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden md:inline">Shanti Space</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              aria-label="Select interface language"
              className="pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer shadow-2xs hover:border-slate-300 transition-colors"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* User Profile / Login Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Sign In or Switch Authorized Account"
            >
              <Key className="w-3 h-3 text-teal-400" />
              <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 uppercase font-mono">
                {roleTitles[currentUser.role]}
              </span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Log Out Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-2">Navigation</span>
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeView === 'home' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600'}`}
            >
              Home
            </button>
            <button
              onClick={() => { onNavigate('victim'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeView === 'victim' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600'}`}
            >
              Victim Check-In Hub
            </button>
            <button
              onClick={() => { if (onOpenExercises) onOpenExercises(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-emerald-800"
            >
              Somatic Exercises Guide
            </button>
            <button
              onClick={() => { if (onOpenRights) onOpenRights(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700"
            >
              Statutory Legal Rights
            </button>
            <button
              onClick={() => { onNavigate('counsellor'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeView === 'counsellor' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600'}`}
            >
              Counsellor Review Queue
            </button>
            <button
              onClick={() => { onNavigate('district'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeView === 'district' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600'}`}
            >
              District Welfare & Interventions
            </button>
            <button
              onClick={() => { onNavigate('national'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeView === 'national' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600'}`}
            >
              National & State Analytics
            </button>
            <button
              onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeView === 'admin' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-600'}`}
            >
              System Admin & Thresholds
            </button>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <button
              onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-teal-400" />
              <span>Switch or Login User Account</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
