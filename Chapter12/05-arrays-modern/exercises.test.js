// Run: node --test 05-arrays-modern/exercises.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadExercises } from '../_lib/load-exercises.js';

const ex = await loadExercises(import.meta.url);

describe('05-arrays-modern', () => {
  it('[BEGINNER] range', () => {
    assert.deepEqual(ex.range(1, 5), [1, 2, 3, 4, 5]);
    assert.deepEqual(ex.range(3, 3), [3]);
    assert.deepEqual(ex.range(-2, 1), [-2, -1, 0, 1]);
    assert.deepEqual(ex.range(5, 1), []);
  });

  it('[BEGINNER] lastItem', () => {
    assert.equal(ex.lastItem(['a', 'b', 'c']), 'c');
    assert.equal(ex.lastItem([]), undefined);
  });

  it('[BEGINNER] chars', () => {
    assert.deepEqual(ex.chars('abc'), ['a', 'b', 'c']);
    assert.deepEqual(ex.chars('ok👍'), ['o', 'k', '👍']);
  });

  it('[BEGINNER] sortedCopy', () => {
    const nums = [30, 4, 100];
    assert.deepEqual(ex.sortedCopy(nums), [4, 30, 100], 'sort numbers as numbers');
    assert.deepEqual(nums, [30, 4, 100], 'the original array must not change');
  });

  it('[BEGINNER] pageNumbers', () => {
    assert.deepEqual(ex.pageNumbers(25, 10), [1, 2, 3]);
    assert.deepEqual(ex.pageNumbers(20, 10), [1, 2]);
    assert.deepEqual(ex.pageNumbers(1, 10), [1]);
    assert.deepEqual(ex.pageNumbers(0, 10), []);
  });

  it('[ADVANCED] starRating', () => {
    assert.equal(ex.starRating(3), '★★★☆☆');
    assert.equal(ex.starRating(0), '☆☆☆☆☆');
    assert.equal(ex.starRating(1, 3), '★☆☆');
  });

  it('[ADVANCED] grid', () => {
    const g = ex.grid(2, 3, 0);
    assert.deepEqual(g, [
      [0, 0, 0],
      [0, 0, 0],
    ]);
    g[0][0] = 1;
    assert.equal(g[1][0], 0, 'each row must be its own array');
    assert.deepEqual(ex.grid(0, 3, 0), []);
  });

  it('[ADVANCED] uniqueSorted', () => {
    const nums = [3, 1, 3, 2, 1];
    assert.deepEqual(ex.uniqueSorted(nums), [1, 2, 3]);
    assert.deepEqual(ex.uniqueSorted([10, 9, 10, 100]), [9, 10, 100], 'sort numbers as numbers');
    assert.deepEqual(nums, [3, 1, 3, 2, 1], 'the original array must not change');
  });

  it('[ADVANCED] replaceAt', () => {
    const letters = ['a', 'b', 'c'];
    assert.deepEqual(ex.replaceAt(letters, 1, 'X'), ['a', 'X', 'c']);
    assert.deepEqual(ex.replaceAt(letters, -1, 'X'), ['a', 'b', 'X']);
    assert.deepEqual(letters, ['a', 'b', 'c'], 'the original array must not change');
  });

  it('[ADVANCED] removeAt', () => {
    const letters = ['a', 'b', 'c'];
    assert.deepEqual(ex.removeAt(letters, 0), ['b', 'c']);
    assert.deepEqual(ex.removeAt(letters, 2), ['a', 'b']);
    assert.deepEqual(letters, ['a', 'b', 'c'], 'the original array must not change');
  });

  it('[ADVANCED] allTags', () => {
    const posts = [
      { title: 'Hooks', tags: ['react', 'js'] },
      { title: 'Express', tags: ['node', 'js'] },
      { title: 'Notes', tags: [] },
    ];
    assert.deepEqual(ex.allTags(posts), ['js', 'node', 'react']);
    assert.deepEqual(ex.allTags([]), []);
  });

  it('[ADVANCED] groupByCourse', () => {
    const ana = { name: 'Ana', course: 'React' };
    const ben = { name: 'Ben', course: 'Node' };
    const carla = { name: 'Carla', course: 'React' };
    // { ...result } turns Object.groupBy's null-prototype object into a plain one,
    // so a plain object or a groupBy result both compare equal here.
    assert.deepEqual({ ...ex.groupByCourse([ana, ben, carla]) }, {
      React: [ana, carla],
      Node: [ben],
    });
  });
});
