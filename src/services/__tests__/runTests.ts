import { 
  calculateOperationalDistress, 
  formatDistressScore, 
  generateOperationalAlerts, 
  SCORING_CONFIG,
  CaseScoringInput,
  ScoreHistoryEntry
} from '../distressScoring';

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
}

console.log('\n--- STARTING DETERMINISTIC DISTRESS SCORING ENGINE TESTS ---\n');

// 1. Minimum possible input
const minInput: CaseScoringInput = {
  caseId: 'TEST-MIN-001',
  sleepScore: 5,
  safetyScore: 5,
  overwhelmScore: 1,
  socialConnectionScore: 5,
  physicalSymptoms: [],
  recentThreatReported: false,
  consecutiveMissedCheckIns: 0,
  voiceStressJitter: 1.0,
};
const minResult = calculateOperationalDistress(minInput);
assert(minResult.score === 0.00, 'Test 1: Minimum input produces 0.00 score');
assert(minResult.level === 'LOW', 'Test 1b: Minimum input level is LOW');

// 2. Maximum possible input
const maxInput: CaseScoringInput = {
  caseId: 'TEST-MAX-001',
  sleepScore: 1,
  safetyScore: 1,
  overwhelmScore: 5,
  socialConnectionScore: 1,
  physicalSymptoms: ['tremors', 'palpitations', 'chills', 'insomnia'],
  recentThreatReported: true,
  threatDetails: 'Imminent witness coercion threat',
  consecutiveMissedCheckIns: 4,
  voiceStressJitter: 4.8,
};
const maxResult = calculateOperationalDistress(maxInput);
assert(maxResult.score <= 10.00, 'Test 2: Maximum input does not exceed 10.00');
assert(maxResult.score >= 8.50, 'Test 2b: Maximum input reaches URGENT range');
assert(maxResult.priority === 'urgent', 'Test 2c: Priority is urgent');

// 3. Missing inputs handle gracefully without crashing
const emptyInput: CaseScoringInput = { caseId: 'TEST-EMPTY-001' };
const emptyResult = calculateOperationalDistress(emptyInput);
assert(!isNaN(emptyResult.score), 'Test 3: Missing inputs handled without NaN');
assert(emptyResult.factorBreakdown.length === 8, 'Test 3b: All 8 factor breakdowns populated');

// 4. Invalid input clamping
const invalidInput: CaseScoringInput = {
  caseId: 'TEST-INVALID-001',
  sleepScore: -10, // should clamp to 1
  safetyScore: 99, // should clamp to 5
  overwhelmScore: 100, // should clamp to 5
  socialConnectionScore: -5, // should clamp to 1
};
const invalidResult = calculateOperationalDistress(invalidInput);
assert(invalidResult.score >= 0 && invalidResult.score <= 10, 'Test 4: Out-of-bounds input clamped safely');

// 5 & 6 & 7. Clamping boundaries
assert(minResult.score >= 0.00, 'Test 5: Score never below 0');
assert(maxResult.score <= 10.00, 'Test 6: Score never exceeds 10');

// 8. Decimal precision
assert(formatDistressScore(7.354).startsWith('7.35'), 'Test 8: Decimal precision formatted to 2 decimals');

// 9. Reproducibility test (Run 100 times, must yield 100% identical outputs)
const stableSampleInput: CaseScoringInput = {
  caseId: 'TEST-REPRO-001',
  sleepScore: 2,
  safetyScore: 2,
  overwhelmScore: 4,
  socialConnectionScore: 2,
  physicalSymptoms: ['headaches'],
  recentThreatReported: false,
};
const baselineRun = calculateOperationalDistress(stableSampleInput);
let allIdentical = true;
for (let i = 0; i < 100; i++) {
  const rerun = calculateOperationalDistress(stableSampleInput);
  if (rerun.score !== baselineRun.score || rerun.normalizedScore !== baselineRun.normalizedScore) {
    allIdentical = false;
    break;
  }
}
assert(allIdentical, 'Test 9: Exact deterministic reproducibility across 100 repeated executions');

// 10. Different inputs produce different outputs
const mildInput: CaseScoringInput = {
  caseId: 'TEST-MILD-001',
  sleepScore: 4,
  safetyScore: 4,
  overwhelmScore: 2,
  socialConnectionScore: 4,
};
const mildResult = calculateOperationalDistress(mildInput);
assert(mildResult.score < baselineRun.score, 'Test 10: Lower distress input produces lower calculated score');

// 11. One measurement returns INSUFFICIENT_DATA
const singleHistoryInput: CaseScoringInput = {
  ...mildInput,
  historyMeasurements: [],
};
const singleHistoryResult = calculateOperationalDistress(singleHistoryInput);
assert(singleHistoryResult.trajectory === 'INSUFFICIENT_DATA', 'Test 11: Single/no historical measurement gives INSUFFICIENT_DATA');

// 12 & 13. Increasing trend detection
const historyPrevLow: ScoreHistoryEntry = {
  id: 'H1',
  caseId: 'TEST-MILD-001',
  score: 2.00,
  level: 'LOW',
  scoringVersion: '1.0.0',
  source: 'check_in',
  calculatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
};
const increasingInput: CaseScoringInput = {
  ...stableSampleInput,
  historyMeasurements: [historyPrevLow],
};
const increasingResult = calculateOperationalDistress(increasingInput);
assert(increasingResult.trajectory === 'INCREASING' || increasingResult.trajectory === 'RAPID_CHANGE', 'Test 13: Increasing trend detected correctly');

// 14. Decreasing trend detection
const historyPrevHigh: ScoreHistoryEntry = {
  id: 'H2',
  caseId: 'TEST-MILD-001',
  score: 8.50,
  level: 'URGENT',
  scoringVersion: '1.0.0',
  source: 'check_in',
  calculatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
};
const decreasingInput: CaseScoringInput = {
  ...mildInput,
  historyMeasurements: [historyPrevHigh],
};
const decreasingResult = calculateOperationalDistress(decreasingInput);
assert(decreasingResult.trajectory === 'DECREASING', 'Test 14: Decreasing recovery trend detected');

// 15. Rapid change detection (>= 1.5 delta within 72h)
const historyRecent: ScoreHistoryEntry = {
  id: 'H3',
  caseId: 'TEST-MAX-001',
  score: 3.50,
  level: 'LOW',
  scoringVersion: '1.0.0',
  source: 'check_in',
  calculatedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
};
const rapidInput: CaseScoringInput = {
  ...maxInput,
  historyMeasurements: [historyRecent],
};
const rapidResult = calculateOperationalDistress(rapidInput);
assert(rapidResult.trajectory === 'RAPID_CHANGE', 'Test 15: Rapid change detected when delta >= 1.5 within 72h');

// 16. Alert generation on trigger
const alerts = generateOperationalAlerts(rapidResult, 'TEST-MAX-001');
assert(alerts.length > 0, 'Test 16: Alert generated on rapid change & high distress');
assert(alerts.some(a => a.type === 'ACUTE_SPIKE'), 'Test 16b: ACUTE_SPIKE alert created');

// 17. Duplicate alert prevention
const duplicateAlerts = generateOperationalAlerts(rapidResult, 'TEST-MAX-001', alerts);
assert(duplicateAlerts.length === 0, 'Test 17: Duplicate alerts prevented via deduplication check');

// 18. Scoring version is stored
assert(rapidResult.scoringVersion === '1.0.0', 'Test 18: Scoring version explicitly stored');

// 19. Human review flag required on high/urgent priority
assert(rapidResult.requiresHumanReview === true, 'Test 19: Human review flagged as required on urgent priority');

// 20. Historical score persistence check
assert(historyRecent.score === 3.50 && historyRecent.scoringVersion === '1.0.0', 'Test 20: Historical score remains immutable');

console.log('\n🌟 ALL 20 UNIT TESTS PASSED SUCCESSFULLY! 🌟\n');
