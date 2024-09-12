import { Layout, LoadingScreen, useOdeClient } from '@edifice-ui/react';

import { matchPath, Outlet, ScrollRestoration } from 'react-router-dom';
import { basename } from '..';

/** Check old format URL and redirect if needed */
export const loader = async () => {
  const hashLocation = window.location.hash.substring(1);

  console.log({ hashLocation });

  // Check if the URL is an old format (angular root with hash) and redirect to the new format
  if (hashLocation) {
    const isPath = matchPath('/view/:id', hashLocation);
    const isPage = matchPath('/view/:id/:idpage', hashLocation);

    console.log({ isPage });

    if (isPath) {
      // Redirect to the new format
      const redirectPath = `/id/${isPath?.params.id}`;
      window.location.replace(
        window.location.origin + basename.replace(/\/$/g, '') + redirectPath
      );
    }

    if (isPage) {
      // Redirect to the new format
      const redirectPath = `/id/${isPage?.params.id}/page/${isPage?.params.idpage}`;
      window.location.replace(
        window.location.origin + basename.replace(/\/$/g, '') + redirectPath
      );
    }
  }

  return null;
};

export const Root = () => {
  const { init } = useOdeClient();

  if (!init) return <LoadingScreen position={false} />;

  return (
    <Layout>
      <Outlet />
      <ScrollRestoration />
    </Layout>
  );
};

export default Root;
