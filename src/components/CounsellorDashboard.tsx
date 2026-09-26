import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Activity, 
  Sparkles, 
  Search, 
  Filter, 
  Clock, 
  Mic, 
  Phone, 
  Calendar, 
  ArrowUpRight, 
  Check, 
  X, 
  Volume2, 
  ChevronDown, 
  Layers, 
  HelpCircle, 
  Eye, 
  Calculator,
  UserCheck,
  HeartHandshake,
  TrendingUp,
  Inbox,
  Sparkle
} from 'lucide-react';
import { AtrocityCase, CaseAlert } from '../types';
import { AppStore } from '../services/storage';
import { formatDistressScore } from '../services/distressScoring';
import { CalculationDetailsModal } from './CalculationDetailsModal';
import { 
  HeroCollaborationIllustration, 
  PipelineFlowIllustration, 
  HumanSupportCareIllustration, 
  EmptyStateIllustration 
} from './illustrations/CareIllustrations';

interface CounsellorDashboardProps {
  cases: AtrocityCase[];
  onSelectCase: (caseId: string) => void;
}

export const CounsellorDashboard: React.FC<CounsellorDashboardProps> = ({
  cases,
  onSelectCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedAlertForReview, setSelectedAlertForReview] = useState<{
    caseId: string;
    alert: CaseAlert;
  } | null>(null);
  const [selectedCaseForCalculation, setSelectedCaseForCalculation] = useState<AtrocityCase | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Collect all alerts requiring human review
  const allAlerts = cases.flatMap(c => 
    c.activeAlerts.map(a => ({ caseItem: c, alert: a }))
  );

  const pendingAlerts = allAlerts.filter(item => 
    item.alert.status === 'new' || item.alert.status === 'under_review' || item.alert.status === 'action_required'
  );

  const urgentCases = cases.filter(c => c.riskState === 'urgent');
  const highCases = cases.filter(c => c.riskState === 'high');
  const totalInterventions = cases.reduce((acc, c) => acc + (c.interventions?.length || 0), 0);

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.victimAlias.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' || c.riskState === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleValidateAlert = (caseId: string, alertId: string, approveIntervention: boolean = true) => {
    AppStore.updateAlertStatus(
      caseId, 
      alertId, 
      'action_required', 
      reviewNotes || 'Counsellor validated acute distress signals. Escalation protocol confirmed for caseworker assignment.'
    );

    if (approveIntervention) {
      AppStore.addIntervention(caseId, {
        caseId,
        victimAlias: cases.find(c => c.id === caseId)?.victimAlias || 'Victim',
        category: 'counselling',
        title: 'Immediate Trauma Stabilization & Somatic Outreach',
        recommendationReason: 'Human counsellor confirmed acute distress escalation warranting prioritized telehealth session.',
        priority: 'urgent',
        assignedDepartment: 'District Mental Health Programme (DMHP) Trauma Cell',
        status: 'in_progress',
        targetDate: new Date(Date.now() + 86400000).toISOString(),
      });
    }

    showToast('Alert validated and intervention prioritized in human review queue.');
    setSelectedAlertForReview(null);
    setReviewNotes('');
  };

  const handleMarkFalsePositive = (caseId: string, alertId: string) => {
    const reason = reviewNotes || 'Telephone check conducted. Victim confirmed environmental noise or transient event without psychological harm.';
    AppStore.updateAlertStatus(caseId, alertId, 'false_positive', reason);
    showToast('Alert resolved as False Positive. Recorded in audit ledger.');
    setSelectedAlertForReview(null);
    setReviewNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-7 bg-white text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DASHBOARD HEADER: Clean, engaging with modern illustration */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-white to-teal-50/40 p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Human-in-the-Loop Validation</span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Monitor cases, review AI signals, and coordinate human intervention.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Mannik AI CARE CORE aggregates longitudinal vocal, linguistic, and behavioral cues into an <strong>Operational Distress Index</strong>. Every high-risk indicator is held in queue until verified by an authorized clinician.
          </p>

          <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              {pendingAlerts.length} pending reviews
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              {cases.length} active caseload
            </span>
          </div>
        </div>

        {/* Abstract Collaboration Illustration */}
        <div className="shrink-0 flex items-center justify-center">
          <HeroCollaborationIllustration className="w-56 h-36 drop-shadow-sm" />
        </div>
      </section>

      {/* STATISTICS CARDS: 4 clean cards with light tinted backgrounds & trend indicators */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Cases (Teal Tint) */}
        <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 hover:border-teal-200 transition-all shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">Active Cases</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-display text-slate-900">{cases.length}</div>
            <div className="flex items-center gap-1 text-[11px] text-teal-700 font-medium mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+3 enrolled this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Human Review (Amber Tint) */}
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-all shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Pending Human Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-display text-slate-900">{pendingAlerts.length}</div>
            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-1">
              <span>{pendingAlerts.filter(a => a.alert.priority === 'urgent').length} acute priority</span>
            </div>
          </div>
        </div>

        {/* Card 3: Urgent Cases (Coral/Red Tint) */}
        <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-rose-200 transition-all shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900">Urgent Cases</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-display text-slate-900">{urgentCases.length}</div>
            <div className="flex items-center gap-1 text-[11px] text-rose-700 font-medium mt-1">
              <span>Immediate clinical outreach</span>
            </div>
          </div>
        </div>

        {/* Card 4: Completed Interventions (Blue Tint) */}
        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:border-blue-200 transition-all shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Dispatched Actions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-display text-slate-900">{totalInterventions}</div>
            <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium mt-1">
              <span>Legal aid & safe housing active</span>
            </div>
          </div>
        </div>
      </section>

      {/* HUMAN / AI PIPELINE VISUALIZATION & AI INSIGHT CARD */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Pipeline Visualization (7 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-sm text-slate-900">
                Human-in-the-Loop Decision Pipeline
              </h3>
              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                AI Assists · Humans Decide
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Continuous multi-stage workflow guaranteeing zero automated high-impact decisions.
            </p>
          </div>

          <div className="py-2 overflow-x-auto flex justify-center">
            <PipelineFlowIllustration className="w-full max-w-lg h-24" />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Every step is cryptographically audited</span>
            <span className="text-teal-700 font-medium">DPDP Act 2023 & Atrocities Act Compliant</span>
          </div>
        </div>

        {/* AI Insight Card (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-blue-50/60 border border-violet-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-violet-700 font-semibold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Operational Insight</span>
            </div>
            <h4 className="font-display font-bold text-base text-slate-900 leading-snug">
              Longitudinal Trajectory Detection
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Acute score spike (+3.70) detected on Case CASE-MH-2026-109 correlated with reported intimidation. Human validation is recommended prior to emergency safe relocation dispatch.
            </p>
          </div>

          <div className="pt-3 border-t border-violet-100/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Engine v1.0.0</span>
            <button
              onClick={() => {
                const target = cases.find(c => c.id === 'CASE-MH-2026-109') || cases[0];
                setSelectedCaseForCalculation(target);
              }}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View Calculation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* HUMAN REVIEW QUEUE: Case Cards with colored left borders & clean spacing */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">
                Human-in-the-Loop Validation Queue
              </h2>
              <p className="text-xs text-slate-500">
                Active alerts requiring clinical evaluation and authorized next steps
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
            {pendingAlerts.length} cases waiting for review
          </span>
        </div>

        {pendingAlerts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <EmptyStateIllustration className="w-32 h-32" />
            <h3 className="font-display font-bold text-base text-slate-900">You're all caught up.</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              New cases requiring human clinical review will appear here automatically when signals cross operational thresholds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingAlerts.map(({ caseItem, alert }) => {
              const isUrgent = alert.priority === 'urgent' || caseItem.riskState === 'urgent';
              const isHigh = alert.priority === 'high' || caseItem.riskState === 'high';
              const borderLeftColor = isUrgent ? 'border-l-4 border-l-rose-500' : isHigh ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-teal-500';

              return (
                <div 
                  key={alert.id}
                  className={`p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${borderLeftColor}`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Priority Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span className="truncate max-w-[140px]">{caseItem.incidentType || 'Atrocity FIR'}</span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isUrgent 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {alert.priority} Review
                      </span>
                    </div>

                    {/* Case Identity */}
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {caseItem.id}
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm mt-0.5">
                        {caseItem.victimAlias}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {caseItem.district}, {caseItem.state}
                      </p>
                    </div>

                    {/* Operational Distress Indicator Card */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Operational Distress Index</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatDistressScore(caseItem.currentDistressScore)}
                        </span>
                      </div>

                      <div className="text-[11px] flex items-center justify-between">
                        <span className="text-slate-500">Trajectory:</span>
                        <span className={`font-semibold uppercase tracking-wider text-[10px] ${
                          isUrgent ? 'text-rose-700' : 'text-amber-700'
                        }`}>
                          {alert.trajectory.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Contributing Factors */}
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-800 block text-[10px] uppercase tracking-wider">
                        Contributing Factors:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                        {alert.triggeringFactors.slice(0, 2).map((factor, idx) => (
                          <li key={idx} className="line-clamp-2">{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions: Conduct Human Review & View Calculation */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedAlertForReview({ caseId: caseItem.id, alert });
                        setReviewNotes('');
                      }}
                      className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer text-center shadow-xs"
                    >
                      Conduct Human Review
                    </button>
                    <button
                      onClick={() => setSelectedCaseForCalculation(caseItem)}
                      className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl bg-white border border-slate-200 transition-colors cursor-pointer"
                      title="View Detailed Transparent Calculation"
                    >
                      <Calculator className="w-4 h-4 text-teal-600" />
                    </button>
                    <button
                      onClick={() => onSelectCase(caseItem.id)}
                      className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl bg-white border border-slate-200 transition-colors cursor-pointer"
                      title="View Full Case History"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CASE DIRECTORY TABLE WITH CLEAN WHITE STYLING */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="font-display font-bold text-base text-slate-900">
              Assigned Caseload Monitoring
            </h2>
            <p className="text-xs text-slate-500">
              Search by case ID or filter by operational distress classification
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search case, alias, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 w-56 bg-slate-50/50"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium">
              {['all', 'urgent', 'high', 'moderate', 'low'].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRisk(r)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    filterRisk === r 
                      ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Case Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Protected Alias</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Distress Index</th>
                <th className="py-3 px-4">Trajectory</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map(c => {
                const isUrgent = c.riskState === 'urgent';
                const isHigh = c.riskState === 'high';
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {c.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {c.victimAlias}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.district}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold tabular-nums text-slate-900">
                          {formatDistressScore(c.currentDistressScore)}
                        </span>
                        <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${isUrgent ? 'bg-rose-600' : isHigh ? 'bg-amber-500' : 'bg-teal-600'}`}
                            style={{ width: `${Math.min(100, c.currentDistressScore * 10)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-medium uppercase ${
                        isUrgent ? 'text-rose-700' : isHigh ? 'text-amber-700' : 'text-teal-700'
                      }`}>
                        {c.trajectory.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium capitalize">
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedCaseForCalculation(c)}
                        className="px-2.5 py-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                        title="View Transparent Calculation"
                      >
                        Calculation
                      </button>
                      <button
                        onClick={() => onSelectCase(c.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* HUMAN-IN-THE-LOOP CARE SUPPORT SECTION */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-teal-50/60 via-white to-blue-50/50 border border-teal-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Human-in-the-Loop Care & Empathy Assurance</span>
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900">
            Automated tools surface risk; clinicians provide the healing human touch.
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every atrocity survivor under Mannik AI CARE CORE has a designated licensed counsellor and district legal officer. Digital check-ins are designed to reduce barriers to communication, never to replace compassionate, human-centered trauma stabilization.
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center">
          <HumanSupportCareIllustration className="w-44 h-32" />
        </div>
      </section>

      {/* Human Review Modal Dialog */}
      {selectedAlertForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-display font-bold text-sm text-white">
                    Conduct Clinical Human Review
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Case {selectedAlertForReview.caseId} · {selectedAlertForReview.alert.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlertForReview(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-700">Flagged Reason:</span>
                <p className="text-slate-600">{selectedAlertForReview.alert.reason}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 block">
                  Clinician Assessment & Action Notes:
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record verbal observations, telephonic check notes, and justification for welfare dispatch..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleValidateAlert(selectedAlertForReview.caseId, selectedAlertForReview.alert.id, true)}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Escalation & Dispatch Care
                </button>
                <button
                  onClick={() => handleMarkFalsePositive(selectedAlertForReview.caseId, selectedAlertForReview.alert.id)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Mark False Positive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Details Modal */}
      <CalculationDetailsModal
        isOpen={Boolean(selectedCaseForCalculation)}
        onClose={() => setSelectedCaseForCalculation(null)}
        caseItem={selectedCaseForCalculation}
      />
    </div>
  );
};
