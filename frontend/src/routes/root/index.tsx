import { Layout, LoadingScreen, useOdeClient } from '@edifice-ui/react';
import { Outlet, useLocation } from 'react-router-dom';

/** Check old format URL and redirect if needed */
export const loader = async () => {
  return null;
};

export const Root = () => {
  const location = useLocation();

  const { init } = useOdeClient();

  if (!init) return <LoadingScreen position={false} />;

  return (
    <Layout headless={location.pathname !== '/'}>
      <Outlet />
    </Layout>
  );
};

export default Root;
