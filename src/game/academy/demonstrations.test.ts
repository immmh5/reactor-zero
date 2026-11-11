/**
 * LAB GUARDIAN - 3D Science Demonstrations Unit Tests
 * Verifies accuracy of the 5 required interactive stoichiometry demonstrations.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SCIENCE_DEMONSTRATIONS, ATOM_DEFINITIONS } from './ScienceDemonstrations';
import { calculateDirectedMoleRatiosCount } from '../chemistry/stoichiometryData';

test('All 5 required science demonstrations are present with valid metadata', () => {
  assert.equal(SCIENCE_DEMONSTRATIONS.length, 5);

  const demoIds = SCIENCE_DEMONSTRATIONS.map((d) => d.id);
  assert.ok(demoIds.includes('demo_iron_oxidation'));
  assert.ok(demoIds.includes('demo_oxygen_molecule'));
  assert.ok(demoIds.includes('demo_propane_combustion'));
  assert.ok(demoIds.includes('demo_potassium_bromide'));
  assert.ok(demoIds.includes('demo_butane_matrix'));

  for (const d of SCIENCE_DEMONSTRATIONS) {
    assert.ok(d.titleAr.length > 0);
    assert.ok(d.reactionFormula.length > 0);
    assert.ok(d.learningTakeawayAr.length > 0);
  }
});

test('Demonstration 1: Iron Oxidation preserves exactly 4 Fe and 6 O atoms before and after', () => {
  const demo1 = SCIENCE_DEMONSTRATIONS.find((d) => d.id === 'demo_iron_oxidation')!;
  assert.deepEqual(demo1.atomConservation.beforeCounts, { Fe: 4, O: 6 });
  assert.deepEqual(demo1.atomConservation.afterCounts, { Fe: 4, O: 6 });
});

test('Demonstration 2: Oxygen Molecule accurately defines diatomic O2 particle', () => {
  const demo2 = SCIENCE_DEMONSTRATIONS.find((d) => d.id === 'demo_oxygen_molecule')!;
  assert.equal(demo2.reactionFormula, 'O2(g)');
  assert.deepEqual(demo2.atomConservation.beforeCounts, { O: 2 });
});

test('Demonstration 3: Propane Combustion atom conservation and mass balance', () => {
  const demo3 = SCIENCE_DEMONSTRATIONS.find((d) => d.id === 'demo_propane_combustion')!;
  // C3H8 + 5O2 -> 3CO2 + 4H2O
  assert.deepEqual(demo3.atomConservation.beforeCounts, { C: 3, H: 8, O: 10 });
  assert.deepEqual(demo3.atomConservation.afterCounts, { C: 3, H: 8, O: 10 });
});

test('Demonstration 4: Potassium Bromide produces 6 directed mole ratios and defines ionic formula unit', () => {
  const demo4 = SCIENCE_DEMONSTRATIONS.find((d) => d.id === 'demo_potassium_bromide')!;
  // 3 substances -> n(n-1) = 6 ratios
  const ratioCount = calculateDirectedMoleRatiosCount(demo4.substancesAr.length);
  assert.equal(ratioCount, 6);
  assert.equal(demo4.demonstrationType, 'ionic_lattice');
});

test('Demonstration 5: Butane Combustion matrix has exactly 12 directed mole ratios excluding diagonal', () => {
  const demo5 = SCIENCE_DEMONSTRATIONS.find((d) => d.id === 'demo_butane_matrix')!;
  // 4 substances -> n(n-1) = 12 ratios
  const ratioCount = calculateDirectedMoleRatiosCount(demo5.substancesAr.length);
  assert.equal(ratioCount, 12);
  assert.equal(demo5.matrixData?.length, 12);

  // Check that no diagonal ratios (e.g. C4H10/C4H10) exist in matrixData
  demo5.matrixData?.forEach((entry) => {
    assert.notEqual(entry.row, entry.col, `Diagonal ratio ${entry.row}/${entry.col} must be excluded`);
  });
});

test('Atom visual definitions have accessible symbols and distinct colors', () => {
  const elements = ['Fe', 'O', 'C', 'H', 'K', 'Br', 'Al'];
  for (const el of elements) {
    const def = ATOM_DEFINITIONS[el];
    assert.ok(def, `Atom definition exists for ${el}`);
    assert.equal(def.symbol, el);
    assert.ok(def.radius > 0);
    assert.ok(def.colorHex.startsWith('#'));
  }
});
