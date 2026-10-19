// Run: node --test 04-arrays-callbacks/exercises.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadExercises } from '../_lib/load-exercises.js';

const ex = await loadExercises(import.meta.url);

// A fresh copy for every test, so one test can't break another.
const makeStudents = () => [
  { id: 1, name: 'Ana', grade: 92, course: 'React' },
  { id: 2, name: 'Ben', grade: 67, course: 'Node' },
  { id: 3, name: 'Carla', grade: 78, course: 'React' },
  { id: 4, name: 'Dev', grade: 55, course: 'Node' },
  { id: 5, name: 'Eli', grade: 88, course: 'MongoDB' },
];

describe('04-arrays-callbacks', () => {
  it('[BEGINNER] names', () => {
    assert.deepEqual(ex.names(makeStudents()), ['Ana', 'Ben', 'Carla', 'Dev', 'Eli']);
    assert.deepEqual(ex.names([]), []);
  });

  it('[BEGINNER] passing', () => {
    const students = makeStudents();
    assert.deepEqual(ex.passing(students).map((s) => s.name), ['Ana', 'Carla', 'Eli']);
    assert.deepEqual(ex.passing(students, 90).map((s) => s.name), ['Ana']);
    assert.equal(students.length, 5, 'the original array must not change');
  });

  it('[BEGINNER] toListItems', () => {
    assert.deepEqual(ex.toListItems(['Ana', 'Ben']), ['<li>Ana</li>', '<li>Ben</li>']);
    assert.deepEqual(ex.toListItems([]), []);
  });

  it('[BEGINNER] findById', () => {
    const students = makeStudents();
    assert.equal(ex.findById(students, 3), students[2], 'return the object itself, not a copy');
    assert.equal(ex.findById(students, 99), undefined);
  });

  it('[BEGINNER] allPassed', () => {
    assert.equal(ex.allPassed(makeStudents(), 50), true);
    assert.equal(ex.allPassed(makeStudents(), 70), false);
    assert.equal(ex.allPassed(makeStudents()), false, 'min defaults to 70');
  });

  it('[BEGINNER] anyInCourse', () => {
    assert.equal(ex.anyInCourse(makeStudents(), 'React'), true);
    assert.equal(ex.anyInCourse(makeStudents(), 'Python'), false);
  });

  it('[BEGINNER] doubled (fix the bug)', () => {
    assert.deepEqual(ex.doubled([1, 2, 3]), [2, 4, 6]);
  });

  it('[ADVANCED] sortedGrades (fix the two bugs)', () => {
    const grades = [92, 8, 100, 67];
    assert.deepEqual(ex.sortedGrades(grades), [8, 67, 92, 100], 'sort numbers as numbers');
    assert.deepEqual(grades, [92, 8, 100, 67], 'the original array must not change');
  });

  it('[ADVANCED] passingList', () => {
    const students = makeStudents();
    assert.deepEqual(ex.passingList(students), [
      '<li>Ana (92)</li>',
      '<li>Eli (88)</li>',
      '<li>Carla (78)</li>',
    ]);
    assert.deepEqual(ex.passingList(students, 100), []);
    assert.deepEqual(
      students.map((s) => s.name),
      ['Ana', 'Ben', 'Carla', 'Dev', 'Eli'],
      'the original order must not change',
    );
  });

  it('[ADVANCED] average', () => {
    assert.equal(ex.average(makeStudents()), 76);
    assert.equal(ex.average([]), 0);
  });

  it('[ADVANCED] countByCourse', () => {
    assert.deepEqual(ex.countByCourse(makeStudents()), { React: 2, Node: 2, MongoDB: 1 });
    assert.deepEqual(ex.countByCourse([]), {});
  });

  it('[ADVANCED] renderList', () => {
    assert.equal(ex.renderList(['Ana', 'Ben']), '<ul>\n  <li>Ana</li>\n  <li>Ben</li>\n</ul>');
    assert.equal(ex.renderList([]), '<p>Nothing to show</p>');
  });
});
