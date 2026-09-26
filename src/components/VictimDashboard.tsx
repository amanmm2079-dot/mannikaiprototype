import React, { useState } from 'react';
import { 
  Heart, 
  Mic, 
  MessageSquare, 
  Activity, 
  Calendar, 
  Clock, 
  PhoneCall, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Volume2, 
  ChevronRight, 
  CheckCircle,
  Wind,
  Info,
  Smile,
  Meh,
  Frown,
  AlertOctagon,
  PhoneForwarded,
  ArrowRight,
  Scale,
  Calculator
} from 'lucide-react';
import { AtrocityCase, CheckIn, LanguageCode } from '../types';
import { speakText, TRANSLATIONS } from '../services/i18n';
import { GroundingModal } from './GroundingModal';
import { CheckInModal } from './CheckInModal';
import { CalculationDetailsModal } from './CalculationDetailsModal';
import { AppStore } from '../services/storage';
import { formatDistressScore, formatScoreNumber } from '../services/distressScoring';

interface VictimDashboardProps {
  caseItem: AtrocityCase;
  language: LanguageCode;
  isOffline: boolean;
  onOpenExercises?: () => void;
  onOpenRights?: () => void;
  onToggleCamouflage?: () => void;
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({
  caseItem,
  language,
  isOffline,
  onOpenExercises,
  onOpenRights,
  onToggleCamouflage,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const [quickFeelingLogged, setQuickFeelingLogged] = useState<string | null>(null);

  // Sparkline data from recent check-ins
  const recentScores = [...caseItem.historyCheckIns].reverse().map(c => c.distressScore);
  if (recentScores.length === 0) recentScores.push(caseItem.currentDistressScore);

  const getScoreBand = (score: number) => {
    if (score >= 8.5) return { label: 'High Distress State', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (score >= 6.5) return { label: 'Moderate Concern', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: 'Stable Wellness State', color: 'text-teal-800 bg-teal-50 border-teal-200' };
  };

  const band = getScoreBand(caseItem.currentDistressScore);

  // Quick 1-tap feeling buttons for low-literacy users
  const handleQuickFeeling = (level: number, label: string, voiceCue: string) => {
    speakText(voiceCue, language);
    setQuickFeelingLogged(label);

    // Save instant check-in
    AppStore.submitCheckIn(caseItem.id, {
      caseId: caseItem.id,
      channel: 'touch',
      language,
      textResponse: `One-touch emotion check: ${label}`,
      answers: {
        sleepQuality: level >= 4 ? 2 : 4,
        safetyFeel: level >= 4 ? 1 : level === 3 ? 3 : 5,
        overwhelmLevel: level,
        socialConnection: level >= 4 ? 1 : 4,
      },
    }, isOffline);

    setTimeout(() => {
      setQuickFeelingLogged(null);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 bg-slate-50/40 text-slate-900">
      {/* SECTION 1: ILLITERATE-FRIENDLY ONE-TAP EMOTION CHECK */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌸</span>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 leading-tight">
                {t.howAreYouFeeling}
              </h2>
              <p className="text-xs text-slate-500">
                Tap the picture that matches your heart right now (एक स्पर्श से बताएं)
              </p>
            </div>
          </div>
          <button
            onClick={() => speakText("How are you feeling today? Tap the face that matches your mood right now.", language)}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Listen in your language"
          >
            <Volume2 className="w-5 h-5 text-teal-700" />
          </button>
        </div>

        {/* 4 Large Expressive Emotion Buttons (No reading required) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Peaceful */}
          <button
            onClick={() => handleQuickFeeling(1, 'Peaceful & Safe', 'You recorded feeling peaceful and safe. We are glad you are well.')}
            className="p-4 rounded-2xl bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/80 flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer text-center group shadow-2xs"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🕊️</span>
            <div>
              <span className="font-bold text-sm text-teal-950 block">Peaceful</span>
              <span className="text-[11px] text-teal-700 font-medium">शांत व सुरक्षित</span>
            </div>
          </button>

          {/* Okay */}
          <button
            onClick={() => handleQuickFeeling(2, 'Okay / Managing', 'You recorded feeling okay. Take gentle rest today.')}
            className="p-4 rounded-2xl bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/80 flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer text-center group shadow-2xs"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🙂</span>
            <div>
              <span className="font-bold text-sm text-sky-950 block">Okay</span>
              <span className="text-[11px] text-sky-700 font-medium">सब ठीक है</span>
            </div>
          </button>

          {/* Worried */}
          <button
            onClick={() => handleQuickFeeling(3, 'Worried / Heavy', 'You recorded feeling worried. Your counsellor is informed.')}
            className="p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer text-center group shadow-2xs"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">😟</span>
            <div>
              <span className="font-bold text-sm text-amber-950 block">Worried</span>
              <span className="text-[11px] text-amber-700 font-medium">चिंता में</span>
            </div>
          </button>

          {/* Scared / Need Help */}
          <button
            onClick={() => handleQuickFeeling(5, 'Fear / In Danger', 'Alert sent. We are reaching out to you immediately.')}
            className="p-4 rounded-2xl bg-rose-50/80 hover:bg-rose-100 border border-rose-200 flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer text-center group shadow-2xs"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🆘</span>
            <div>
              <span className="font-bold text-sm text-rose-950 block">Need Help</span>
              <span className="text-[11px] text-rose-700 font-medium">डर / मदद चाहिए</span>
            </div>
          </button>
        </div>

        {quickFeelingLogged && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <span>Status recorded: <strong>{quickFeelingLogged}</strong>. Counsellor team informed.</span>
            </span>
            <span className="text-[11px] text-teal-700 font-mono">Encrypted & Saved</span>
          </div>
        )}
      </div>

      {/* SECTION 2: DISTINCT FEATURE CARDS (Voice, Breathing, and Protection) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Big Microphone Voice Check-In */}
        <div 
          onClick={() => setIsCheckInOpen(true)}
          className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="h-44 bg-slate-100 relative overflow-hidden">
            <img
              src="/src/assets/images/card_voice_speak_1790415180330.jpg"
              alt="Voice Check-in"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-4">
              <div className="flex items-center justify-between w-full text-white">
                <span className="font-display font-bold text-lg flex items-center gap-2">
                  <Mic className="w-5 h-5 text-rose-400" />
                  <span>{t.voiceCheckIn}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold backdrop-blur-xs">
                  Tap to Speak
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              बोलकर अपनी बात कहें। Speak freely in your language. Our voice analyzer listens safely to your feelings.
            </p>
          </div>
        </div>

        {/* Card B: Shanti Grounding Sanctuary */}
        <div 
          onClick={() => setIsGroundingOpen(true)}
          className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="h-44 bg-slate-100 relative overflow-hidden">
            <img
              src="/src/assets/images/card_grounding_peace_1790415199922.jpg"
              alt="Shanti Grounding Room"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-transparent to-transparent flex items-end p-4">
              <div className="flex items-center justify-between w-full text-white">
                <span className="font-display font-bold text-lg flex items-center gap-2">
                  <Wind className="w-5 h-5 text-teal-300" />
                  <span>{t.groundingSpace}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold backdrop-blur-xs">
                  Breathe In / Out
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              शांति केंद्र व श्वास क्रिया। Paced breathing circles with nature soundscapes (Bamboo Rain & Morning Breeze).
            </p>
          </div>
        </div>

        {/* Card C: Somatic Trauma Exercises */}
        {onOpenExercises && (
          <div 
            onClick={onOpenExercises}
            className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col cursor-pointer group hover:shadow-md transition-all"
          >
            <div className="h-44 bg-slate-100 relative overflow-hidden">
              <img
                src="/src/assets/images/card_somatic_exercise_1790415603414.jpg"
                alt="Somatic Exercises"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full text-white">
                  <span className="font-display font-bold text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    <span>Somatic Exercises</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold backdrop-blur-xs">
                    Butterfly Hug & 5-4-3-2-1
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-xs text-slate-600 leading-relaxed">
                शारीरिक विश्राम व्यायाम। Bilateral tapping, sensory grounding, and muscle relaxation for sudden stress.
              </p>
            </div>
          </div>
        )}

        {/* Card D: Legal Rights & Compensation */}
        {onOpenRights && (
          <div 
            onClick={onOpenRights}
            className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col cursor-pointer group hover:shadow-md transition-all"
          >
            <div className="h-44 bg-slate-100 relative overflow-hidden">
              <img
                src="/src/assets/images/card_safety_shield_1790415213169.jpg"
                alt="Legal Rights and Compensation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-transparent to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full text-white">
                  <span className="font-display font-bold text-lg flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-300" />
                    <span>Rights & DBT Relief</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold backdrop-blur-xs">
                    3-Stage Disbursal
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-xs text-slate-600 leading-relaxed">
                कानून व मुआवजा अधिकार। Free DLSA legal defense, 24/7 witness protection, and statutory DBT compensation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CURRENT OPERATIONAL DISTRESS INDEX CARD */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Decision Support Indicator
            </span>
            <h3 className="font-display font-bold text-xl text-slate-900">
              Operational Distress Index
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCalculationOpen(true)}
              className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg border border-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>View Calculation</span>
            </button>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${band.color}`}>
              {band.label}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="font-mono text-5xl font-bold text-slate-900 tabular-nums">
            {formatScoreNumber(caseItem.currentDistressScore)}
          </span>
          <span className="text-slate-400 text-sm font-medium">/ 10.00</span>
          <div className="ml-auto text-right text-xs">
            <span className={`font-semibold ${caseItem.scoreChange > 0 ? 'text-amber-600' : 'text-teal-600'}`}>
              {caseItem.scoreChange > 0 ? `+${caseItem.scoreChange}` : caseItem.scoreChange} pts
            </span>
            <span className="text-slate-400 block text-[10px]">vs previous check-in</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Decision-support indicator calculated from recorded check-ins — requires human clinician validation.
        </p>

        {/* 7-Day Trend Bars */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100">
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Recent Trajectory</span>
            <span className="capitalize font-semibold text-slate-800">{caseItem.trajectory.replace('_', ' ')}</span>
          </div>
          <div className="h-8 flex items-end gap-1.5 pt-1">
            {recentScores.slice(-7).map((sc, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className={`w-full rounded-t transition-all ${
                    sc >= 8.5 ? 'bg-rose-500' : sc >= 6.5 ? 'bg-amber-400' : 'bg-teal-500'
                  }`}
                  style={{ height: `${Math.max(15, (sc / 10) * 100)}%` }}
                />
                <span className="text-[9px] text-slate-400 font-mono">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: ASSIGNED COUNSELLOR & PROTECTION CONTACT */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>{t.assignedSupport}</span>
          </h3>
          <button
            onClick={() => speakText(`Your assigned counsellor is ${caseItem.assignedCounsellorName}`, language)}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            AS
          </div>
          <div className="text-xs flex-1 space-y-1">
            <span className="font-semibold text-slate-900 text-sm block">
              {caseItem.assignedCounsellorName}
            </span>
            <span className="text-slate-500 text-[11px] block">
              Lead Clinical Counsellor (DMHP Pune)
            </span>
            <p className="text-slate-600 text-xs italic pt-1 leading-relaxed">
              "We are right here with you. Do not hesitate to check in or press SOS whenever you feel overwhelmed."
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
          <span>Assigned Welfare Officer: <strong>{caseItem.assignedCaseworkerName}</strong></span>
          <span className="font-mono text-slate-400">{caseItem.id}</span>
        </div>
      </div>

      {/* SECTION 5: 24x7 EMERGENCY SOS BUTTON */}
      <div className="p-6 rounded-2xl bg-rose-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-200 animate-bounce" />
            <h3 className="font-display font-bold text-lg text-white">
              Emergency 24x7 Survivor Helpline
            </h3>
          </div>
          <p className="text-xs text-rose-100 max-w-md leading-relaxed">
            आपातकालीन सहायता (Toll-Free 181 / 112). Immediate police protection, ambulance, and legal defense.
          </p>
        </div>

        <a
          href="tel:181"
          className="w-full sm:w-auto px-6 py-3 bg-white text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          <PhoneCall className="w-4 h-4 fill-current" />
          <span>Call 181 Now</span>
        </a>
      </div>

      {/* Modals */}
      <GroundingModal
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
        language={language}
        victimAlias={caseItem.victimAlias}
      />

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        caseItem={caseItem}
        language={language}
        isOffline={isOffline}
      />

      <CalculationDetailsModal
        isOpen={isCalculationOpen}
        onClose={() => setIsCalculationOpen(false)}
        caseItem={caseItem}
      />
    </div>
  );
};
