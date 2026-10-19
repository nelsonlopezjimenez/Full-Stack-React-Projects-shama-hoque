// Run: node --test 01-strings/exercises.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadExercises } from '../_lib/load-exercises.js';

const ex = await loadExercises(import.meta.url);

describe('01-strings', () => {
  it('[BEGINNER] shout', () => {
    assert.equal(ex.shout('hi'), 'HI!');
    assert.equal(ex.shout('Hello there'), 'HELLO THERE!');
  });

  it('[BEGINNER] initials', () => {
    assert.equal(ex.initials('ada lovelace'), 'A.L.');
    assert.equal(ex.initials('grace brewster hopper'), 'G.B.H.');
  });

  it('[BEGINNER] extension', () => {
    assert.equal(ex.extension('photo.JPG'), 'jpg');
    assert.equal(ex.extension('archive.tar.gz'), 'gz');
    assert.equal(ex.extension('README'), '');
  });

  it('[BEGINNER] padId', () => {
    assert.equal(ex.padId(7, 4), '0007');
    assert.equal(ex.padId(12345, 4), '12345');
  });

  it('[ADVANCED] isPalindrome', () => {
    assert.equal(ex.isPalindrome('Never odd or even'), true);
    assert.equal(ex.isPalindrome('racecar'), true);
    assert.equal(ex.isPalindrome('hello'), false);
  });

  it('[ADVANCED] truncate', () => {
    assert.equal(ex.truncate('Hello world', 8), 'Hello w…');
    assert.equal(ex.truncate('Hello world', 8).length, 8);
    assert.equal(ex.truncate('Hi', 8), 'Hi');
    assert.equal(ex.truncate('12345678', 8), '12345678');
  });

  it('[ADVANCED] slugify', () => {
    assert.equal(ex.slugify('  Hello, World!  '), 'hello-world');
    assert.equal(ex.slugify('React & Node: 2026'), 'react-node-2026');
  });
});
