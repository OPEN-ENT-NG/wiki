/**
 * DO NOT MODIFY
 */

import '@testing-library/jest-dom/vitest';
import { RenderOptions, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import '../i18n';
import { Providers } from '../providers';
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
) => {
  return {
    user,
    ...render(ui, { wrapper: Providers, ...options }),
  };
};

export const wrapper = Providers;
export * from '@testing-library/react';
export { customRender as render };
