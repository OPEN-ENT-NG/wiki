import { ERROR_CODE } from '@edifice.io/client';
import { EdificeClientProvider, EdificeThemeContext } from '@edifice.io/react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (typeof error === 'string') {
        if (error === ERROR_CODE.NOT_LOGGED_IN)
          window.location.replace('/auth/login');
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
});

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <EdificeClientProvider
        params={{
          app: 'wiki',
        }}
      >
        {children}
      </EdificeClientProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export const CustomProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const themeContextValue = {
    theme: 'default',
    setTheme: vi.fn(),
  } as any;

  return (
    <Providers>
      <EdificeThemeContext.Provider value={themeContextValue}>
        {children}
      </EdificeThemeContext.Provider>
    </Providers>
  );
};
