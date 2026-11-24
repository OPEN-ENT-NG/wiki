/**
 * DO NOT MODIFY
 */

// Load polyfills FIRST before any other imports
import './polyfills';

import '@testing-library/jest-dom/vitest';
import { RenderOptions, render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'i18next';
import { ReactElement } from 'react';
import { initReactI18next } from 'react-i18next';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { CustomProviders } from '../providers';
import { server } from './server';

await i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'common',
  ns: ['common', 'wiki'],
  resources: { fr: { common: {}, wiki: {} } },
  interpolation: { escapeValue: false, prefix: '[[', suffix: ']]' },
});

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
