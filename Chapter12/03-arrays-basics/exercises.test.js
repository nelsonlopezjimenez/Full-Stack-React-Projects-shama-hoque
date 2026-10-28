// Run: node --test 03-arrays-basics/exercises.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadExercises } from '../_lib/load-exercises.js';

const ex = await loadExercises(import.meta.url);

describe('03-arrays-basics', () => {
  it('[BEGINNER] firstAndLast', () => {
    assert.deepEqual(ex.firstAndLast(['a', 'b', 'c']), ['a', 'c']);
    assert.deepEqual(ex.firstAndLast(['solo']), ['solo', 'solo']);
  });

  it('[BEGINNER] contains', () => {
    assert.equal(ex.contains(['cat', 'dog'], 'dog'), true);
    assert.equal(ex.contains(['cat', 'dog'], 'Dog'), false);
    assert.equal(ex.contains([], 'cat'), false);
  });

  it('[BEGINNER] positionOf', () => {
    assert.equal(ex.positionOf(['a', 'b', 'c'], 'b'), 2);
    assert.equal(ex.positionOf(['a', 'b', 'c'], 'a'), 1);
    assert.equal(ex.positionOf(['a', 'b', 'a'], 'a'), 1, 'use the first match');
    assert.equal(ex.positionOf(['a', 'b', 'c'], 'z'), 0);
  });

  it('[BEGINNER] firstN', () => {
    const nums = [10, 20, 30, 40];
    assert.deepEqual(ex.firstN(nums, 2), [10, 20]);
    assert.deepEqual(ex.firstN(nums, 0), []);
    assert.deepEqual(ex.firstN([10, 20], 5), [10, 20]);
    assert.deepEqual(nums, [10, 20, 30, 40], 'the original array must not change');
  });

  it('[BEGINNER] merge', () => {
    const a = [1, 2];
    const b = [3];
    const result = ex.merge(a, b);
    assert.deepEqual(result, [1, 2, 3]);
    assert.notEqual(result, a, 'return a new array, not `a`');
    assert.deepEqual(a, [1, 2], '`a` must not change');
    assert.deepEqual(b, [3], '`b` must not change');
  });

  it('[BEGINNER] joinLine (changes the array)', () => {
    const line = ['Ana'];
    assert.equal(ex.joinLine(line, 'Ben'), 2, 'return the new length');
    assert.deepEqual(line, ['Ana', 'Ben'], 'the queue itself must change');
  });

  it('[BEGINNER] serveNext (changes the array)', () => {
    const line = ['Ana', 'Ben'];
    assert.equal(ex.serveNext(line), 'Ana');
    assert.deepEqual(line, ['Ben'], 'the queue itself must change');
    assert.equal(ex.serveNext([]), undefined);
  });

  it('[BEGINNER] isEmpty (fix the bug)', () => {
    assert.equal(ex.isEmpty([]), true);
    assert.equal(ex.isEmpty([0]), false);
  });

  it('[BEGINNER] copyAndAdd (fix the bug)', () => {
    const nums = [1, 2];
    assert.deepEqual(ex.copyAndAdd(nums, 3), [1, 2, 3]);
    assert.deepEqual(nums, [1, 2], 'the original array must not change');
  });

  it('[ADVANCED] reversedCopy', () => {
    const nums = [1, 2, 3];
    assert.deepEqual(ex.reversedCopy(nums), [3, 2, 1]);
    assert.deepEqual(nums, [1, 2, 3], 'the original array must not change');
  });

  it('[ADVANCED] removeAt (changes the array)', () => {
    const letters = ['a', 'b', 'c'];
    assert.equal(ex.removeAt(letters, 1), 'b', 'return the removed item, not an array');
    assert.deepEqual(letters, ['a', 'c'], 'the array itself must change');
    assert.equal(ex.removeAt(letters, -1), 'c');
    assert.deepEqual(letters, ['a']);
  });

  it('[ADVANCED] insertAt (changes the array)', () => {
    const letters = ['a', 'c'];
    const result = ex.insertAt(letters, 1, 'b');
    assert.deepEqual(letters, ['a', 'b', 'c'], 'the array itself must change');
    assert.equal(result, letters, 'return the same array');
    ex.insertAt(letters, 0, 'start');
    assert.deepEqual(letters, ['start', 'a', 'b', 'c']);
  });

  it('[ADVANCED] middle', () => {
    assert.deepEqual(ex.middle([1, 2, 3, 4, 5]), [3]);
    assert.deepEqual(ex.middle([1, 2, 3, 4]), [2, 3]);
    assert.deepEqual(ex.middle(['x']), ['x']);
    assert.deepEqual(ex.middle([]), []);
  });

  it('[ADVANCED] rotate', () => {
    const nums = [1, 2, 3, 4, 5];
    assert.deepEqual(ex.rotate(nums, 2), [3, 4, 5, 1, 2]);
    assert.deepEqual(ex.rotate(nums, 0), [1, 2, 3, 4, 5]);
    assert.deepEqual(ex.rotate(nums, 5), [1, 2, 3, 4, 5]);
    assert.deepEqual(ex.rotate([1, 2, 3], 4), [2, 3, 1]);
    assert.deepEqual(ex.rotate([], 3), []);
    assert.deepEqual(nums, [1, 2, 3, 4, 5], 'the original array must not change');
  });

  it('[ADVANCED] toSentence', () => {
    assert.equal(ex.toSentence(['Ana', 'Ben', 'Carla']), 'Ana, Ben and Carla');
    assert.equal(ex.toSentence(['Ana', 'Ben']), 'Ana and Ben');
    assert.equal(ex.toSentence(['Ana']), 'Ana');
    assert.equal(ex.toSentence([]), '');
  });
});
