/**
 * DO NOT MODIFY
 */

// Load polyfills FIRST before any other imports
import './polyfills';

import '@testing-library/jest-dom/vitest';
import { RenderOptions, render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import '../i18n';
import { CustomProviders } from '../providers';
import { server } from './server';

// Enable API mocking before tests.
beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'bypass',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const user = userEvent.setup();

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult & { user: typeof user } => {
  return {
    user,
    ...render(ui, { wrapper: CustomProviders, ...options }),
  };
};

export const wrapper = CustomProviders;
export * from '@testing-library/react';
export { customRender as render };
