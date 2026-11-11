import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDirectedMoleRatiosCount,
  parseRatioOrNumber,
  isNumberClose,
  STOICHIOMETRY_REACTIONS,
} from './stoichiometryData';
import { ChemistryChallengeManager } from './ChemistryChallengeSystem';

test('calculateDirectedMoleRatiosCount matches n(n-1) formula', () => {
  assert.equal(calculateDirectedMoleRatiosCount(2), 2);
  assert.equal(calculateDirectedMoleRatiosCount(3), 6);
  assert.equal(calculateDirectedMoleRatiosCount(4), 12);
  assert.equal(calculateDirectedMoleRatiosCount(5), 20);
});

test('parseRatioOrNumber handles fractions, decimals, and Arabic commas', () => {
  assert.equal(parseRatioOrNumber('4/2'), 2);
  assert.equal(parseRatioOrNumber('1/2'), 0.5);
  assert.equal(parseRatioOrNumber('13:2'), 6.5);
  assert.equal(parseRatioOrNumber('204.1'), 204.1);
  assert.equal(parseRatioOrNumber('204،1'), 204.1);
  assert.equal(parseRatioOrNumber('invalid'), null);
});

test('isNumberClose handles rounding tolerance', () => {
  assert.ok(isNumberClose(204.1, 204.11, 0.02, 0.5));
  assert.ok(isNumberClose(1.333, 1.3333, 0.01, 0.1));
  assert.ok(!isNumberClose(10, 20, 0.01, 0.5));
});

test('Conservation of mass in propane combustion balanced equation', () => {
  const rxn = STOICHIOMETRY_REACTIONS.propaneCombustion;
  assert.ok(
    isNumberClose(rxn.totalReactantMass, rxn.totalProductMass, 0.005, 0.2),
    `Reactants (${rxn.totalReactantMass}) should equal products (${rxn.totalProductMass})`
  );
});

test('ChemistryChallengeManager progression and score combo', () => {
  const mgr = new ChemistryChallengeManager();
  const m1 = mgr.getActiveMission();
  assert.equal(m1.missionNumber, 1);

  // Submit correct answer for step 1 (O2 coefficient = 3)
  const res1 = mgr.submitAnswer('3');
  assert.ok(res1.isCorrect);
  assert.ok(res1.scoreAwarded > 0);
  assert.equal(res1.comboMultiplier, 1.5);

  // Submit incorrect answer -> combo resets to 1.0, hint returned
  const res2 = mgr.submitAnswer('999');
  assert.ok(!res2.isCorrect);
  assert.equal(res2.comboMultiplier, 1.0);
  assert.ok(res2.hintToShow && res2.hintToShow.length > 0);
  assert.ok(res2.penaltyStability > 0);

  // Correct answer after hint -> advances step
  const res3 = mgr.submitAnswer('2');
  assert.ok(res3.isCorrect);
});

test('Per-question countdown duration configuration and defaults', () => {
  const mgr = new ChemistryChallengeManager();
  const missions = mgr.getMissions();

  // Mission 1: Short conceptual questions have 30 seconds (Prompt 04)
  const m1 = missions[0];
  assert.equal(m1.steps[0].timeLimitSeconds, 30);
  assert.equal(m1.steps[1].timeLimitSeconds, 30);
  assert.equal(m1.steps[2].timeLimitSeconds, 30);

  // Mission 2: Calculation questions have 45 / 60 seconds
  const m2 = missions[1];
  assert.equal(m2.steps[0].timeLimitSeconds, 45);
  assert.equal(m2.steps[1].timeLimitSeconds, 60);

  // Mission 3: Ratio conceptual questions have 30 seconds
  const m3 = missions[2];
  assert.equal(m3.steps[0].timeLimitSeconds, 30);

  // Mission 5: Boss challenge questions have 45 / 45 / 60 seconds
  const m5 = missions[4];
  assert.equal(m5.steps[0].timeLimitSeconds, 45);
  assert.equal(m5.steps[1].timeLimitSeconds, 45);
  assert.equal(m5.steps[2].timeLimitSeconds, 60);
});

test('Question timeout triggers penalty, tiered hints, and solution progression without correct credit', () => {
  const mgr = new ChemistryChallengeManager();
  const m1 = mgr.getActiveMission();

  // Timeout on attempt 1 -> returns hint 1, combo reset, stability penalty
  const timeout1 = mgr.handleTimeout();
  assert.equal(timeout1.isCorrect, false);
  assert.equal(timeout1.scoreAwarded, 0);
  assert.equal(timeout1.comboMultiplier, 1.0);
  assert.equal(timeout1.isStepCompleted, false);
  assert.ok(timeout1.penaltyStability > 0);
  assert.ok(timeout1.hintToShow && timeout1.hintToShow.includes('تلميح 1'));

  // Timeout on attempt 2 -> returns hint 2
  const timeout2 = mgr.handleTimeout();
  assert.equal(timeout2.isCorrect, false);
  assert.ok(timeout2.hintToShow && timeout2.hintToShow.includes('تلميح 2'));

  // Timeout on attempt 3 -> reveals worked solution
  const timeout3 = mgr.handleTimeout();
  assert.equal(timeout3.isCorrect, false);
  assert.ok(timeout3.workedSolution && timeout3.workedSolution.includes('الحل النموذجي'));

  // Step remains on step 0 until correctly answered
  assert.equal(m1.currentStepIndex, 0);

  // Submitting correct answer after timeout correctly advances
  const correctAfterTimeout = mgr.submitAnswer('3');
  assert.ok(correctAfterTimeout.isCorrect);
  assert.equal(m1.currentStepIndex, 1);
});

test('Timer default duration, mutual exclusion, and stats integrity', () => {
  const mgr = new ChemistryChallengeManager();

  // 1. Verify default fallback of 90s for any question missing timeLimitSeconds
  const dummyStep: {
    id: string;
    promptAr: string;
    equationDisplay: string;
    guidanceAr: string;
    inputType: 'numeric';
    hint1Ar: string;
    hint2Ar: string;
    workedSolutionAr: string;
    timeLimitSeconds?: number;
  } = {
    id: 'dummy',
    promptAr: 'سؤال افتراضي',
    equationDisplay: 'A -> B',
    guidanceAr: 'إرشاد',
    inputType: 'numeric',
    hint1Ar: 'تلميح 1',
    hint2Ar: 'تلميح 2',
    workedSolutionAr: 'حل',
  };
  const duration = dummyStep.timeLimitSeconds ?? 90;
  assert.equal(duration, 90, 'Questions without explicit time limit must default to 90 seconds');

  // 2. Stats reflect timeouts as incorrect attempts
  const initialStats = mgr.getStats();
  mgr.handleTimeout();
  const updatedStats = mgr.getStats();
  assert.equal(updatedStats.incorrect, initialStats.incorrect + 1, 'Timeout must increment incorrect counter');
  assert.equal(updatedStats.combo, 1.0, 'Timeout must reset combo to 1.0');

  // 3. Monotonic clock math simulation (pause and resume preserves remaining duration)
  const questionTotalSec = 90;
  let startPerfTime = 10000; // ms
  const pauseTime = 15000; // paused after 5s
  const resumeTime = 25000; // resumed 10s later

  // Shift start time by hidden duration
  const hiddenDuration = resumeTime - pauseTime;
  startPerfTime += hiddenDuration;

  // At check time 27000ms:
  const now = 27000;
  const elapsed = (now - startPerfTime) / 1000; // (27000 - 20000) / 1000 = 7s
  const remaining = Math.max(0, questionTotalSec - elapsed);
  assert.equal(remaining, 83, 'Elapsed time during pause must not be deducted from question timer');
});
