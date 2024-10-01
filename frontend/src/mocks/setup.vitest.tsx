import '@testing-library/jest-dom';
import { RenderOptions, render } from '@testing-library/react';
import { ReactElement } from 'react';

import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import '../i18n';
import { Providers, queryClient } from '../providers';
import './setup.msw';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Providers, ...options }),
  };
};

/**
 * https://reactrouter.com/en/main/routers/create-memory-router
 * We use Memory Router with its "data router" form to make asumptions
 * Useful when we want to test navigation or redirection
 */
export const renderWithRouter = (path = '/', element: JSX.Element) => {
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
    ...customRender(<RouterProvider router={router} />),
  };
};

export const wrapper = Providers;
export * from '@testing-library/react';
export { queryClient, customRender as render };

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});
