import '@testing-library/jest-dom';
import { RenderOptions, render } from '@testing-library/react';
import { ReactElement } from 'react';

import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import '../i18n';
import { Providers } from '../providers';
import './setup.msw';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: Providers, ...options });

/**
 * https://reactrouter.com/en/main/routers/create-memory-router
 * We use Memory Router with its "data router" form to make asumptions
 * Useful when we want to test navigation or redirection
 */
export const renderWithRouter = (
  path = '/',
  element: JSX.Element,
  mockedPath: string
) => {
  const routes = [
    {
      path,
      element,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: [mockedPath],
  });

  return {
    /**
     * We use our customRender fn to wrap Router with our Providers
     */
    ...customRender(<RouterProvider router={router} />),
  };
};

export * from '@testing-library/react';
export { customRender as render };
