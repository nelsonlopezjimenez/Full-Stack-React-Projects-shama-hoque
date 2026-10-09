import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

import App from './App.jsx';

// [BEGINNER] This file is the tutorial's index.js. You won't edit it during the tutorial: it is
// the bridge between your component in App.jsx and the browser. It finds <div id="root"> in
// index.html and tells React to draw <App /> inside it.
//
// [ADVANCED] <StrictMode> only matters in development: React renders every component twice to
// expose code that is not "pure" (lesson 08 explains the word). The production build skips it.
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
