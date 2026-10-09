import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
// Adds DOM matchers such as toBeInTheDocument() and toHaveTextContent() to expect().
// (jest-dom 7 dropped the '/vitest' entry point; registering the matchers is one line.)
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Every test starts with an empty page.
afterEach(() => {
  cleanup();
});
