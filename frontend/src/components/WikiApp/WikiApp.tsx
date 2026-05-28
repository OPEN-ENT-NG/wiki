import React, { useEffect, useRef } from 'react';
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
import WikiAppProvider from './providers/WikiAppProvider';
import { ActionDropdownMenuOptions } from '~/features';

/**
 * Wiki App Component Props
 */
export interface WikiAppProps {
  /** Wiki Id to retrieve wiki information and pages */
  wikiId: string;
  /**
   * Show or not the Wiki application header.
   * When Wiki is integrated in an app (for example Communities) then we can hide the Wiki app header.
   */
  header?: boolean;
  /** Additional Actions to show in the Wiki Page dropdown menu */
  additionalActions?: AdditionalActions;
  /** Additional CSS classes for styling purposes, can be helpful to fix some visual integration issues inside another app. */
  className?: string;
}

/**
 * Additional Actions to show in the Wiki Page dropdown menu.
 * Those actions can be displayed in a specific Dropdown Menu Group if the dropdownMenuGroupLabel is set.
 */
export interface AdditionalActions {
  /** Additional Actions */
  actions: ActionDropdownMenuOptions[];
  /** Dropdown Menu Group Label */
  dropdownMenuGroupLabel?: string;
}

/**
 * Wiki App component that can be called to integrate Wiki App inside another app.
 * For example "Cours à la Une" in Communities.
 *
 * See WikiAppProps to know what props can be passed to the component.
 */
const WikiApp: React.FC<WikiAppProps> = ({
  wikiId,
  header,
  additionalActions,
  className,
}) => {
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
      <QueryClientProvider client={queryClient}>
        <EdificeClientProvider params={{ app: 'wiki' }}>
          <EdificeThemeProvider>
            <WikiAppProvider
              wikiId={wikiId}
              header={header}
              additionalActions={additionalActions}
            >
              <RouterProvider router={routerRef.current} />
            </WikiAppProvider>
          </EdificeThemeProvider>
        </EdificeClientProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>,
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

  return <div ref={containerRef} className={className} />;
};

export default WikiApp;
