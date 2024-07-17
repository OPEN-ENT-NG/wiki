import React, { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { ThemeProvider } from '@edifice-ui/react';
import { RouterProvider } from 'react-router-dom';
import './i18n';
import { Providers, queryClient } from './providers';
import { router } from './routes';
// import './services/WikiResourceService';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

if (import.meta.env.DEV) {
  // eslint-disable-next-line global-require
  import('@axe-core/react').then((axe) => {
    axe.default(React, root, 1000);
  });
}

root.render(
  <StrictMode>
    <Providers>
      <ThemeProvider>
        <RouterProvider router={router(queryClient)} />
      </ThemeProvider>
    </Providers>
  </StrictMode>
);
