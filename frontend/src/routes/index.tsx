import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

import { Explorer } from 'ode-explorer/lib';
import { explorerConfig } from '~/config';
import { PageError } from '~/routes/errors';
import { NotFound } from './errors/not-found';
import { Page, action as deleteAction, loader as pageLoader } from './page';
import { CreatePage, action as createAction } from './page/create';
import { EditPage, action as editAction } from './page/edit';
import { Pages, loader as pagesLoader } from './page/list';
import { Wiki, loader as wikiLoader } from './wiki';

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
    errorElement: <PageError />,
    children: [
      {
        index: true,
        element: <Explorer config={explorerConfig} />,
      },
      {
        path: 'id/:wikiId',
        children: [
          {
            index: true,
            loader: wikiLoader(queryClient),
            element: <Wiki />,
          },
          {
            path: 'pages',
            loader: pagesLoader(queryClient),
            element: <Pages />,
          },
          {
            path: 'page/:pageId',
            loader: pageLoader(queryClient),
            action: deleteAction,
            element: <Page />,
          },
          {
            path: 'page/create',
            element: <CreatePage />,
            action: createAction,
          },
          {
            path: 'page/:pageId/edit',
            action: editAction,
            element: <EditPage />,
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
