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
import { PagesAssistantRoot } from '~/features/wiki/PagesAssistant/PagesAssistantRoot';
import { PagesAssistantAIStep1Form } from '~/features/wiki/PagesAssistant/PagesAssistantAISteps/PagesAssistantAIStep1Form';
import { PagesAssistantAIStep3StructureLoading } from '~/features/wiki/PagesAssistant/PagesAssistantAISteps/PagesAssistantAIStep3StructureLoading';
import { PagesAssistantAIStep4StructureResult } from '~/features/wiki/PagesAssistant/PagesAssistantAISteps/PagesAssistantAIStep4StructureResult';
import { PagesAssistantAIStep2Form } from '~/features/wiki/PagesAssistant/PagesAssistantAISteps/PagesAssistantAIStep2Form';

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
            path: 'pages/assistant',
            element: <PagesAssistantRoot />,
            errorElement: <PageError withoutLayout={true} />,
          },
          {
            path: 'pages/assistant/ai/step1Form',
            element: <PagesAssistantAIStep1Form />,
          },
          {
            path: 'pages/assistant/ai/step2Form',
            element: <PagesAssistantAIStep2Form />,
          },
          {
            path: 'pages/assistant/ai/step3StructureLoading',
            element: <PagesAssistantAIStep3StructureLoading />,
          },
          {
            path: 'pages/assistant/ai/step4StructureResult',
            element: <PagesAssistantAIStep4StructureResult />,
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
