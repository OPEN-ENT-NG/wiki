import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

import { PageError } from '~/routes/page-error';
import { NotFound } from './not-found';
import { Explorer } from 'ode-explorer/lib';
import { explorerConfig } from '~/config/explorerConfig';

const routes = (queryClient: QueryClient): RouteObject[] => [
  /* Main route */
  {
    path: '/*',
    async lazy() {
      const { loader, Root: Component } = await import('~/routes/root');
      return {
        loader,
        Component,
      };
    },
    children: [
      {
        index: true,
        element: <Explorer config={explorerConfig} />,
      },
    ],
  },
  /* 404 Page */
  {
    path: '*',
    element: <NotFound />,
    errorElement: <PageError />,
  },
];

export const basename = import.meta.env.PROD ? '/collaborativewall' : '/';

export const router = (queryClient: QueryClient) =>
  createBrowserRouter(routes(queryClient), {
    basename,
  });
