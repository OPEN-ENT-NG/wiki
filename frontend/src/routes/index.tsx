import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

import { Explorer } from 'ode-explorer/lib';
import { explorerConfig } from '~/config';
import { PageError } from '~/routes/errors';
import { NotFound } from '~/routes/errors/not-found';
import { Page, action as deleteAction, loader as pageLoader } from './page';
import { CreatePage, action as createAction } from './page/create';
import { EditPage, action as editAction } from './page/edit';
import { Pages, loader as pagesLoader } from './page/list';
import { Index, loader as wikiLoader } from './wiki';

export const routes = (queryClient: QueryClient): RouteObject[] => [
  /* Main route */
  {
    path: '/',
    async lazy() {
      const { loader, Root: Component } = await import('~/routes/root');
      return {
        loader,
        Component,
      };
    },
    errorElement: <PageError />,
    children: [
      {
        index: true,
        element: <Explorer config={explorerConfig} />,
      },
      {
        path: 'id/:wikiId',
        loader: wikiLoader(queryClient),
        element: <Index />,
        children: [
          {
            path: 'pages',
            element: <Pages />,
            loader: pagesLoader(queryClient),
          },
          {
            path: 'page/:pageId',
            element: <Page />,
            loader: pageLoader(queryClient),
            action: deleteAction,
          },
          {
            path: 'page/create',
            element: <CreatePage />,
            action: createAction(queryClient),
          },
          {
            path: 'page/:pageId/edit',
            element: <EditPage />,
            action: editAction(queryClient),
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
