import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '~/mocks/setup.vitest';
import { Index } from '~/routes/wiki/index';

it('render Index component', async () => {
  const FAKE_EVENT = { name: 'test event' };
  const routes = [
    {
      path: '/events/:id',
      element: <Index />,
      loader: () => FAKE_EVENT,
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: ['/', '/events/123'],
    initialIndex: 1,
  });

  render(<RouterProvider router={router} />);

  await waitFor(() => screen.getByTestId('text'));
  expect(screen.getByTestId('text')).toHaveTextContent('some text');
  /* const FAKE_EVENT = { pages: [] };
    const route = '/wiki/123456';

    const router = createMemoryRouter(
      [
        {
          path: '/wiki/:id',
          loader: () => FAKE_EVENT,
          element: <Index />,
        },
      ],
      {
        initialEntries: [route],
        initialIndex: 0,
      }
    );

    render(<RouterProvider router={router} />); */

  /* render(
      <MemoryRouter initialEntries={[route]}>
        <Index />
      </MemoryRouter>
    ); */

  // verify location display is rendered
  /* expect(screen.getByRole('button')).toHaveTextContent(
      'wiki.create.new.page'
    ); */

  screen.debug();
});
