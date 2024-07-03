import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

import { Explorer } from 'ode-explorer/lib';
import { explorerConfig } from '~/config';
import { PageError } from '~/routes/page-error';
import { NotFound } from './not-found';

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
        element: <div>Page Wiki Empty</div>,
        errorElement: <PageError />,
        children: [
          {
            path: 'pages',
            element: <div>Liste de toutes les pages</div>,
            errorElement: <PageError />,
          },
          {
            path: 'page/:pageId',
            element: <div>page par défaut du wiki (page d'accueil)</div>,
            errorElement: <PageError />,
          },
          {
            path: 'page/:pageId/create',
            element: <div>création d'une page</div>,
            errorElement: <PageError />,
          },
          {
            path: 'page/:pageId/edit',
            element: <div>édition d'une page</div>,
            errorElement: <PageError />,
          },
          {
            path: 'page/:pageId/subpage/create',
            element: <div>création page enfant</div>,
            errorElement: <PageError />,
          },
          {
            path: 'page/:pageId/subpage/edit',
            element: <div>édition page enfant</div>,
            errorElement: <PageError />,
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
