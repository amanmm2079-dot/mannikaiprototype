export type UserRole = 
  | 'victim' 
  | 'counsellor' 
  | 'district_officer'
  | 'caseworker' 
  | 'state_admin' 
  | 'national_admin' 
  | 'auditor'
  | 'sys_admin';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te' | 'gu' | 'kn';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  districtId?: string;
  stateId?: string;
  phone?: string;
  language?: LanguageCode;
  createdAt: any;
  updatedAt: any;
}

export interface User {
  id: string;
  uid?: string;
  name: string;
  role: UserRole;
  language: LanguageCode;
  email?: string;
  phone?: string;
  district?: string;
  state?: string;
  districtId?: string;
  stateId?: string;
  assignedCasesCount?: number;
  loginId?: string;
  passcode?: string;
  sessionToken?: string;
  lastLoginAt?: string;
}

export interface FirestoreCase {
  caseId: string;
  ownerUid: string;
  assignedCounsellorUid?: string;
  assignedCounsellorName?: string;
  assignedCaseworkerUid?: string;
  assignedCaseworkerName?: string;
  victimAlias: string;
  location: {
    stateId?: string;
    districtId?: string;
  };
  category: string;
  status:
    | 'submitted'
    | 'triage'
    | 'human_review'
    | 'assigned'
    | 'intervention'
    | 'resolved'
    | 'closed';
  priority: 'normal' | 'high' | 'urgent';
  distressScore?: number;
  previousDistressScore?: number;
  trajectory?: ScoreTrajectory;
  flaggedFactors?: string[];
  incidentType?: string;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  updatedBy: string;
}

export interface CaseEvent {
  id?: string;
  eventType: string;
  description: string;
  createdBy: string;
  createdAt: any;
  metadata?: Record<string, any>;
}

export interface CaseReview {
  id?: string;
  caseId: string;
  reviewerUid: string;
  reviewerName: string;
  reviewerRole: string;
  reviewStatus: string;
  observations: string;
  interventionAction: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: any;
}

export interface FirestoreAuditLog {
  id?: string;
  actorUid: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: any;
  metadata?: Record<string, any>;
}

export interface SomaticExercise {
  id: string;
  title: string;
  hindiTitle: string;
  tagline: string;
  durationMinutes: number;
  stepsCount: number;
  category: 'bilateral' | 'sensory' | 'breath' | 'muscle';
  icon: string;
  steps: Array<{
    title: string;
    instruction: string;
    durationSeconds: number;
    cueSound?: string;
  }>;
}

export interface CompensationRight {
  stage: string;
  percentage: number;
  title: string;
  statutoryRule: string;
  amountSample: string;
  documentsNeeded: string[];
}

export type RiskState = 'low' | 'moderate' | 'high' | 'urgent';

export type ScoreTrajectory = 
  | 'stable' 
  | 'improving' 
  | 'gradual_increase' 
  | 'acute_spike'
  | 'STABLE'
  | 'INCREASING'
  | 'DECREASING'
  | 'RAPID_CHANGE'
  | 'INSUFFICIENT_DATA';

export interface CheckInAudioFeatures {
  pitchVariability: number; // Hz variance
  microTremorJitter: number; // % jitter
  pauseDensity: number; // % silent pauses in speech
  speechRateWpm: number;
  voiceStressLevel: 'low' | 'moderate' | 'high';
}

export interface CheckIn {
  id: string;
  caseId: string;
  channel: 'chat' | 'voice' | 'text' | 'form' | 'ivrs' | 'sms' | 'touch';
  language: LanguageCode;
  textResponse: string;
  answers: {
    sleepQuality?: number; // 1-5
    safetyFeel?: number; // 1-5
    overwhelmLevel?: number; // 1-5
    socialConnection?: number; // 1-5
    physicalSymptoms?: string[];
  };
  audioFeatures?: CheckInAudioFeatures;
  distressScore: number; // 0.0 - 10.0
  analysisStatus: 'completed' | 'queued' | 'offline_pending';
  offlineSynced?: boolean;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  caseId: string;
  score: number;
  previousScore: number;
  scoreChange: number;
  riskState: RiskState;
  escalationFlag: boolean;
  confidence: number; // 0 - 100%
  trajectory: ScoreTrajectory;
  contributingFactors: string[];
  modelVersion: string;
  humanReviewRequired: boolean;
  createdAt: string;
}

export type AlertPriority = 'normal' | 'moderate' | 'high' | 'urgent';

export type AlertStatus = 
  | 'new' 
  | 'acknowledged' 
  | 'under_review' 
  | 'action_required' 
  | 'resolved' 
  | 'false_positive';

export interface CaseAlert {
  id: string;
  caseId: string;
  victimAlias: string;
  district: string;
  state: string;
  priority: AlertPriority;
  status: AlertStatus;
  currentDistressScore: number;
  previousScore: number;
  trajectory: ScoreTrajectory;
  reason: string;
  triggeringFactors: string[];
  assignedCounsellorId: string;
  assignedCaseworkerId: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  reviewerNotes?: string;
}

export type InterventionCategory = 
  | 'counselling' 
  | 'medical_aid' 
  | 'legal_aid' 
  | 'witness_protection' 
  | 'relocation' 
  | 'financial_assistance' 
  | 'rehabilitation';

export type InterventionStatus = 
  | 'recommended' 
  | 'in_progress' 
  | 'dispatched' 
  | 'completed' 
  | 'on_hold';

export interface Intervention {
  id: string;
  caseId: string;
  victimAlias: string;
  category: InterventionCategory;
  title: string;
  recommendationReason: string;
  priority: 'urgent' | 'high' | 'medium' | 'routine';
  assignedDepartment: string;
  status: InterventionStatus;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  actionNotes: Array<{
    author: string;
    timestamp: string;
    note: string;
  }>;
}

export interface AtrocityCase {
  id: string; // e.g. "CASE-MH-2026-081"
  victimAlias: string; // Anonymous protective alias e.g. "Pooja R."
  registrationChannel: 'app' | 'ivrs' | 'sms' | 'portal' | 'nhaa';
  district: string;
  state: string;
  incidentType: string;
  preferredLanguage: LanguageCode;
  assignedCounsellorId: string;
  assignedCounsellorName: string;
  assignedCaseworkerId: string;
  assignedCaseworkerName: string;
  currentDistressScore: number;
  previousDistressScore: number;
  scoreChange: number;
  riskState: RiskState;
  trajectory: ScoreTrajectory;
  consecutiveMissedCheckIns: number;
  lastCheckInDate: string;
  nextScheduledCheckIn: string;
  status: 'active_monitoring' | 'under_human_review' | 'intervention_active' | 'rehabilitated_stable';
  consentGiven: boolean;
  historyCheckIns: CheckIn[];
  recentAssessments: RiskAssessment[];
  activeAlerts: CaseAlert[];
  interventions: Intervention[];
  isSyntheticDemo: boolean;
  scoringVersion?: string;
  factorBreakdown?: any[];
  scoreHistory?: any[];
  calculationExplanation?: string;
  requiresHumanReview?: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: 'case' | 'check_in' | 'alert' | 'intervention' | 'threshold' | 'auth';
  resourceId: string;
  timestamp: string;
  checksum: string;
  details: string;
}

export interface ThresholdConfig {
  lowBandMax: number; // e.g. 3.5
  moderateBandMax: number; // e.g. 6.5
  highBandMax: number; // e.g. 8.4
  urgentBandMin: number; // e.g. 8.5
  escalationDeltaWarning: number; // e.g. +1.8
  missedCheckInsEscalationCount: number; // e.g. 2
  voiceJitterThresholdPercent: number; // e.g. 3.2%
}

export interface SystemIntegrationStatus {
  nhaaPortalSync: {
    status: 'connected' | 'syncing' | 'degraded';
    lastSync: string;
    totalSyncedCases: number;
  };
  ivrsGateway: {
    status: 'online';
    activeTrunks: number;
    completedCalls24h: number;
  };
  smsGateway: {
    status: 'online';
    deliveryRatePercent: number;
    queuedMessages: number;
  };
  fcmPushService: {
    status: 'operational';
    activeListeners: number;
  };
}
