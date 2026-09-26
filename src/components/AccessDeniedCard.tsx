import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, Key } from 'lucide-react';
import { User } from '../types';

interface AccessDeniedCardProps {
  currentUser: User;
  requiredRoleName: string;
  onOpenLogin: () => void;
  onGoHome: () => void;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  currentUser,
  requiredRoleName,
  onOpenLogin,
  onGoHome,
}) => {
  return (
    <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white border border-stone-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
        <ShieldAlert className="w-8 h-8 text-amber-700" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          Security Barrier · Restricted Area
        </span>
        <h2 className="font-display font-bold text-2xl text-stone-900">
          Role Clearance Required
        </h2>
        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
          You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role}). 
          This administrative dashboard requires certified <strong>{requiredRoleName}</strong> credentials.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-left text-xs text-stone-600 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-stone-900">
          <Lock className="w-3.5 h-3.5 text-stone-700" />
          <span>Strict Role-Based Access Control (RBAC)</span>
        </div>
        <p className="text-[11px] text-stone-500">
          Victim identities and internal clinician notes are strictly siloed. Staff and survivors cannot view unassigned cases or confidential system threshold calibrations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={onOpenLogin}
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Key className="w-3.5 h-3.5 text-teal-400" />
          <span>Sign In With Required Clearance</span>
        </button>
        <button
          onClick={onGoHome}
          className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-semibold text-xs hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Safe Hub</span>
        </button>
      </div>
    </div>
  );
};
