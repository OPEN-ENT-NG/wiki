import React, { StrictMode, useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  RouterProvider,
  createMemoryRouter,
  RouteObject,
} from 'react-router-dom';
import { queryClient } from '~/providers';
import { QueryClientProvider } from '@tanstack/react-query';
import { EdificeClientProvider } from '@edifice.io/react';
import { EdificeThemeProvider } from '@edifice.io/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoadingScreen } from '@edifice.io/react';
import { wikiRoutes } from '~/routes';

interface WikiRouterProps {
  wikiId: string;
}

const WikiRouter: React.FC<WikiRouterProps> = ({ wikiId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wikiRootRef = useRef<Root | null>(null);
  const routerRef = useRef<ReturnType<typeof createMemoryRouter> | null>(null);
  const skipCleanupRef = useRef(process.env.NODE_ENV === 'development');
  const isLoading = false;

  const withRouteIds = (
    routes: RouteObject[],
    prefix = 'wiki',
  ): RouteObject[] =>
    routes.map((route, index) => {
      const routeId = route.id ?? `${prefix}-${route.path ?? 'root'}-${index}`;
      const updated: RouteObject = {
        ...route,
        id: routeId,
      };
      if (route.children) {
        (updated as any).children = withRouteIds(route.children, routeId);
      }
      return updated;
    });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (!wikiRootRef.current) {
      wikiRootRef.current = createRoot(containerRef.current);
    }

    if (!routerRef.current) {
      routerRef.current = createMemoryRouter(
        withRouteIds(wikiRoutes(queryClient)),
        { initialEntries: [`/id/${wikiId}`] },
      );
    }

    wikiRootRef.current.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <EdificeClientProvider params={{ app: 'wiki' }}>
            <EdificeThemeProvider>
              <RouterProvider router={routerRef.current} />
            </EdificeThemeProvider>
          </EdificeClientProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </StrictMode>,
    );

    return () => {
      if (skipCleanupRef.current) {
        skipCleanupRef.current = false;
        return;
      }

      const root = wikiRootRef.current;
      wikiRootRef.current = null;
      if (root) {
        setTimeout(() => root.unmount(), 0);
      }
    };
  }, [wikiId]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <div ref={containerRef} />;
};

export default WikiRouter;
