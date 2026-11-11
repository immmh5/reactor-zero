/**
 * LAB GUARDIAN - Stoichiometry Academy Exam Unit Tests
 * Verifies 20-question count, 16/20 passing threshold, flexible answer evaluation,
 * curriculum coverage, and report generation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ExamManager } from './ExamManager';
import { buildCertificationExam, QUESTION_BANK } from './QuestionBank';

test('buildCertificationExam returns exactly 20 questions', () => {
  const exam = buildCertificationExam(1);
  assert.equal(exam.length, 20);

  // Check unique IDs
  const ids = new Set(exam.map((q) => q.id));
  assert.equal(ids.size, 20);
});

test('Exam coverage spans all 10 core curriculum skills', () => {
  const exam = buildCertificationExam(1);
  const skillsInExam = new Set(exam.map((q) => q.skillId));
  assert.equal(skillsInExam.size, 10);
});

test('Question timers respect configured limits (30s, 45s, 60s)', () => {
  for (const q of QUESTION_BANK) {
    assert.ok(
      q.timeLimitSeconds === 30 || q.timeLimitSeconds === 45 || q.timeLimitSeconds === 60,
      `Question ${q.id} has valid time limit (${q.timeLimitSeconds}s)`
    );
  }
});

test('Answer correctness evaluator accepts fractions, decimals, and Arabic formatting', () => {
  const mgr = new ExamManager();

  // Test ratio question: Fe/O2 = 4/3
  const ratioQ = QUESTION_BANK.find((q) => q.id === 'q_ratio_1')!;
  assert.ok(mgr.checkAnswerCorrectness('4/3', ratioQ));
  assert.ok(mgr.checkAnswerCorrectness('4:3', ratioQ));
  assert.ok(mgr.checkAnswerCorrectness('1.33', ratioQ));
  assert.ok(mgr.checkAnswerCorrectness(' 1،33 ', ratioQ)); // Arabic comma
  assert.equal(mgr.checkAnswerCorrectness('2/3', ratioQ), false);

  // Test multiple choice question
  const mcQ = QUESTION_BANK.find((q) => q.id === 'q_eq_1')!;
  assert.ok(mgr.checkAnswerCorrectness('coeff', mcQ));
  assert.equal(mgr.checkAnswerCorrectness('subscript', mcQ), false);

  // Test numeric question: 319.4g
  const numQ = QUESTION_BANK.find((q) => q.id === 'q_mass_cons_1')!;
  assert.ok(mgr.checkAnswerCorrectness('319.4', numQ));
  assert.ok(mgr.checkAnswerCorrectness('319،4', numQ));
  assert.equal(mgr.checkAnswerCorrectness('100', numQ), false);
});

test('Passing threshold requires at least 16 out of 20 (80%)', () => {
  const mgr = new ExamManager();
  mgr.startExam(1);

  // Answer 15 correctly and 5 incorrectly -> 15/20 = 75% -> FAIL
  for (let i = 0; i < 15; i++) {
    const q = mgr.getCurrentQuestion()!;
    mgr.submitAnswer(String(q.correctAnswer));
  }
  for (let i = 0; i < 5; i++) {
    mgr.submitAnswer('incorrect_value');
  }

  const reportFail = mgr.generateReport();
  assert.equal(reportFail.correctCount, 15);
  assert.equal(reportFail.percentageScore, 75);
  assert.equal(reportFail.hasPassed, false);

  // Now test 16 / 20 = 80% -> PASS
  mgr.startExam(1);
  for (let i = 0; i < 16; i++) {
    const q = mgr.getCurrentQuestion()!;
    mgr.submitAnswer(String(q.correctAnswer));
  }
  for (let i = 0; i < 4; i++) {
    mgr.submitAnswer('incorrect_value');
  }

  const reportPass = mgr.generateReport();
  assert.equal(reportPass.correctCount, 16);
  assert.equal(reportPass.percentageScore, 80);
  assert.equal(reportPass.hasPassed, true);
  assert.equal(reportPass.unlockedLocationId, 'refinery');
});

test('buildCertificationExam produces meaningfully different exams across tiers', () => {
  const examTier1 = buildCertificationExam(1);
  const examTier2 = buildCertificationExam(2);
  const examTier3 = buildCertificationExam(3);

  assert.equal(examTier1.length, 20);
  assert.equal(examTier2.length, 20);
  assert.equal(examTier3.length, 20);

  // Each tier must have distinct question composition
  const idsTier1 = new Set(examTier1.map((q) => q.id));
  const idsTier2 = new Set(examTier2.map((q) => q.id));
  const idsTier3 = new Set(examTier3.map((q) => q.id));

  // Verify that Tier 1 and Tier 3 differ by at least 5 questions
  let overlap13 = 0;
  for (const id of idsTier1) {
    if (idsTier3.has(id)) overlap13++;
  }
  assert.ok(overlap13 <= 15, `Tier 1 and Tier 3 should have distinct questions (overlap was ${overlap13})`);

  // Verify all 10 curriculum skills are present in each tier
  const skills1 = new Set(examTier1.map((q) => q.skillId));
  const skills2 = new Set(examTier2.map((q) => q.skillId));
  const skills3 = new Set(examTier3.map((q) => q.skillId));
  assert.equal(skills1.size, 10);
  assert.equal(skills2.size, 10);
  assert.equal(skills3.size, 10);
});
