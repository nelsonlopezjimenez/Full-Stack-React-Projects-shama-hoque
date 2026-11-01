// Loads a topic's exercises.js for its test file.
//
// [BEGINNER] You don't need to read this file. It lets the same tests check
// your exercises.js (npm test) or the instructor's solutions (npm run test:solutions).
//
// [ADVANCED] `import()` with a computed path is a *dynamic import*: it returns a
// Promise of the module, so the test file awaits it at the top level.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const chapterDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// The instructor's private solutions repo, cloned at <repo root>/.solutions/.
// Inside it, paths mirror this repo: full-stack-react-projects/Chapter12/<topic>/.
const solutionsDir = path.join(
  chapterDir, '..', '.solutions', 'full-stack-react-projects', path.basename(chapterDir),
);

export async function loadExercises(testFileUrl) {
  const topicDir = path.dirname(fileURLToPath(testFileUrl));
  const topic = path.basename(topicDir);

  const file = process.env.CH12_SOLUTIONS
    ? path.join(solutionsDir, topic, 'exercises.js')
    : path.join(topicDir, 'exercises.js');

  return import(pathToFileURL(file).href);
}
