import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

import Game from './Game.jsx';

// [BEGINNER] This file is the tutorial's index.js: the bridge between your components and the
// browser. It finds <div id="root"> in index.html and tells React to draw <Game /> inside it.
// Until stage 13 the game was all in App.jsx; since stage 14 every component has its own file.
// main.jsx imports only Game, Game imports Board, Board imports Square and calculateWinner.
//
// [ADVANCED] <StrictMode> only matters in development: React renders every component twice to
// expose code that is not "pure" (lesson 08 explains the word). The production build skips it.
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Game />
  </StrictMode>
);
