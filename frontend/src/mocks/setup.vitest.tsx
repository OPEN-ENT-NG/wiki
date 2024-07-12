import '@testing-library/jest-dom';
import { RenderOptions, render } from '@testing-library/react';
import { ReactElement } from 'react';

import { RouterProvider } from 'react-router-dom';
import { router } from '~/routes';
import '../i18n';
import { Providers, queryClient } from '../providers';
import './setup.msw';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: Providers, ...options });

export const renderWithRouter = (route = '/') => {
  window.history.pushState({}, 'Test page', route);
  return {
    user: '',
    ...customRender(<RouterProvider router={router(queryClient)} />),
  };
};

export * from '@testing-library/react';
export { customRender as render };
