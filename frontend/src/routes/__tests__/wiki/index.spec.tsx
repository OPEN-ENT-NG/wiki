import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { Index } from '~/routes/wiki';

describe('Create new page button', () => {
  beforeEach(async () => {
    const FAKE_EVENT = { pages: [] };
    const routes = [
      {
        path: '/id/:id',
        loader: () => FAKE_EVENT,
        element: <Index />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ['/', '/id/123'],
      initialIndex: 1,
    });

    // await waitFor(() => render(<RouterProvider router={router} />));
    render(<RouterProvider router={router} />);
  });

  it('render Index component', () => {
    console.log('coucou');
  });
});
