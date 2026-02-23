import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render } from './setup';
import type { RenderResult } from '@testing-library/react';

export const renderWithRouter = (
  path = '/',
  element: JSX.Element,
): RenderResult => {
  const routes = [
    {
      path,
      element,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  });

  return {
    /**
     * We use our customRender fn to wrap Router with our Providers
     */
    ...render(<RouterProvider router={router} />),
  };
};
