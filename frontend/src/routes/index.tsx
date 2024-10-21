import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

import { Explorer } from 'ode-explorer/lib';
import { explorerConfig } from '~/config';
import { PageError } from '~/routes/errors';
import { NotFound } from '~/routes/errors/not-found';
import { Page, action as deleteAction, loader as pageLoader } from './page';
import { CreatePage, action as createAction } from './page/create';
import { EditPage, editAction } from './page/edit';
import {
  Component as OldFormat,
  loader as oldFormatLoader,
} from './old-format';
import {
  PageList,
  action as deleteListAction,
  loader as pagesLoader,
} from './page/list/list';
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
            element: <PageList />,
            loader: pagesLoader(queryClient),
          },
          {
            path: 'pages/destroy',
            action: deleteListAction(queryClient),
          },
          {
            path: 'page/:pageId',
            element: <Page />,
            loader: pageLoader(queryClient),
          },
          {
            path: 'page/:pageId/destroy',
            action: deleteAction(queryClient),
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
            element: <CreatePage />,
            action: createAction(queryClient),
          },
          {
            path: 'page/:pageId/version/:versionId',
            element: <Page />,
            loader: pageLoader(queryClient),
          },
          {
            path: 'page/:pageId/oldformat',
            element: <OldFormat />,
            loader: oldFormatLoader(queryClient),
          },
          {
            path: 'page/:pageId/oldformat/edit',
            element: <EditPage />,
            action: editAction(queryClient),
          },
          {
            path: 'page/:pageId/oldformat/destroy',
            action: deleteAction(queryClient),
          },
          {
            path: 'page/:pageId/oldformat/subpage/create',
            element: <CreatePage />,
            action: createAction(queryClient),
          },
        ],
      },
    ],
  },
  {
    async lazy() {
      const { printLoader, Component } = await import('./print');
      return {
        loader: printLoader(queryClient),
        Component,
      };
    },
    path: 'print/id/:wikiId',
    errorElement: <PageError />,
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
