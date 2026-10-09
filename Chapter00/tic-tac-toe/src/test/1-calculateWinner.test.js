// Level 1: a pure function. No React, no page: call it with a board and check what it returns.
//
// [BEGINNER] A test file has `describe` blocks (a group) with `it` blocks (one check each).
// `expect(actual).toBe(expected)` fails the test when the two differ. Run all tests with
// `npm test`, or `npm run test:watch` to run them again on every save.
import { describe, it, expect } from 'vitest';
import { calculateWinner } from '../calculateWinner.js';

// [BEGINNER] A small helper that makes boards easy to read: '.' is an empty square.
// board('XXX', 'OO.', '...') → ['X', 'X', 'X', 'O', 'O', null, null, null, null]
const board = (...rows) => rows.join('').split('').map((c) => (c === '.' ? null : c));

describe('calculateWinner', () => {
  it('returns null for an empty board', () => {
    expect(calculateWinner(Array(9).fill(null))).toBe(null);
  });

  it('finds a row, a column and a diagonal', () => {
    expect(calculateWinner(board('XXX', 'OO.', '...'))).toBe('X');
    expect(calculateWinner(board('XO.', 'XO.', '.O.'))).toBe('O');
    expect(calculateWinner(board('..X', '.XO', 'XO.'))).toBe('X');
  });

  it('returns null while nobody has three in a line', () => {
    expect(calculateWinner(board('XX.', 'OO.', '...'))).toBe(null);
  });

  // [BEGINNER] A full board without three in a line is a draw. The tutorial's game has no
  // message for that yet (one of the exercises in lesson 13), but calculateWinner is right.
  it('returns null for a full board that is a draw', () => {
    expect(calculateWinner(board('XOX', 'XOO', 'OXX'))).toBe(null);
  });
});
