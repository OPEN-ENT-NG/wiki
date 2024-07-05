import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

import { Explorer } from 'ode-explorer/lib';
import { explorerConfig } from '~/config';
import { PageError } from '~/routes/page-error';
import { NotFound } from './not-found';
import { EmptyWiki, loader } from './wiki/empty';

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
      {
        path: 'id/:wikiId',
        loader: loader(queryClient),
        errorElement: <PageError />,
        children: [
          {
            index: true,
            element: <EmptyWiki />,
          },
          {
            path: 'pages',
            element: <div>Liste de toutes les pages</div>,
          },
          {
            path: 'page/:pageId',
            element: <div>page par défaut du wiki (page d'accueil)</div>,
          },
          {
            path: 'page/create',
            element: <div>création d'une page</div>,
          },
          {
            path: 'page/:pageId/edit',
            element: <div>édition d'une page</div>,
          },
          {
            path: 'page/:pageId/subpage/create',
            element: <div>création page enfant</div>,
          },
          {
            path: 'page/:pageId/subpage/edit',
            element: <div>édition page enfant</div>,
          },
        ],
      },
      {
        path: 'print/id/:wallId',
        element: <div>print</div>,
        errorElement: <PageError />,
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

export const basename = import.meta.env.PROD ? '/wiki' : '/';

export const router = (queryClient: QueryClient) =>
  createBrowserRouter(routes(queryClient), {
    basename,
  });
