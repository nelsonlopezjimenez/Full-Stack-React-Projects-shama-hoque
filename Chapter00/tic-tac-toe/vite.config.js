import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// [BEGINNER] Vite is the build tool. `npm run dev` serves the app on http://localhost:5173 with
// hot reload (save a file and the page updates); `npm run build` writes the finished files to dist/.
// The React plugin teaches Vite to read JSX, the HTML-like syntax inside .jsx files.
//
// [ADVANCED] The tutorial runs in CodeSandbox, which does this setup for you. If port 5173 is
// already taken (another chapter's client), Vite picks the next free one and prints it.
export default defineConfig({
  plugins: [react()]
});
