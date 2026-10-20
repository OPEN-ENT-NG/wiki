import { QueryClient } from '@tanstack/react-query';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

import { Explorer } from 'ode-explorer/lib';
import { explorerConfig } from '~/config';
import { PageError } from '~/routes/errors';
import { NotFound } from './errors/not-found';
import {
  Component as OldFormat,
  loader as oldFormatLoader,
} from './old-format';
import { Page, action as deleteAction, loader as pageLoader } from './page';
import { CreatePage, action as createAction } from './page/create';
import { EditPage } from './page/edit';
import {
  PageList,
  action as deleteListAction,
  loader as pagesLoader,
} from './page/list/list';
import { Index, loader as wikiLoader } from './wiki';
import { pageEditAction } from './page/pageEditAction';
import { Home } from '~/features/wiki/PagesAssistant/Home/Home';
import { AIFormGenerate } from '~/features/wiki/PagesAssistant/AI/Form/Generate/AIFormGenerate';
import { ImportPDFGenerate } from '~/features/wiki/PagesAssistant/AI/ImportPDF/Generate/ImportPDFGenerate';
import { AIFormResults } from '~/features/wiki/PagesAssistant/AI/Form/Results/AIFormResults';
import { AIFormStep1 } from '~/features/wiki/PagesAssistant/AI/Form/Steps/Step1/AIFormStep1';
import { AIFormStep2 } from '~/features/wiki/PagesAssistant/AI/Form/Steps/Step2/AIFormStep2';
import { ImportPDFResults } from '~/features/wiki/PagesAssistant/AI/ImportPDF/Results/ImportPDFResults';

export const wikiRoutes = (queryClient: QueryClient): RouteObject[] => [
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
        path: 'pages/assistant',
        element: <Home />,
        errorElement: <PageError withoutLayout={true} />,
      },
      {
        path: 'pages/assistant/ai/step1Form',
        element: <AIFormStep1 />,
      },
      {
        path: 'pages/assistant/ai/step2Form',
        element: <AIFormStep2 />,
      },
      {
        path: 'pages/assistant/ai/formGenerate',
        element: <AIFormGenerate />,
      },
      {
        path: 'pages/assistant/ai/formResults',
        element: <AIFormResults />,
      },
      {
        path: 'pages/assistant/ai/importPDFGenerate',
        element: <ImportPDFGenerate />,
      },
      {
        path: 'pages/assistant/ai/importPDFResults',
        element: <ImportPDFResults />,
      },
      {
        path: 'page/:pageId',
        element: <Page />,
        action: pageEditAction(queryClient),
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
        action: pageEditAction(queryClient),
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
        action: pageEditAction(queryClient, 'oldformat'),
      },
      {
        path: 'page/:pageId/oldformat/edit',
        element: <EditPage />,
        action: pageEditAction(queryClient, 'oldformat'),
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
];

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
      ...wikiRoutes(queryClient),
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

export const router = (
  queryClient: QueryClient,
): ReturnType<typeof createBrowserRouter> =>
  createBrowserRouter(routes(queryClient), {
    basename,
  });
