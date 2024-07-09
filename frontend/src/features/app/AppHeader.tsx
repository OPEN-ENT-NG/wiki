import {
  AppHeader as BaseAppHeader,
  Breadcrumb,
  useOdeClient,
} from '@edifice-ui/react';
import { IWebApp } from 'edifice-ts-client';

export const AppHeader = () => {
  const { currentApp } = useOdeClient();

  return (
    <BaseAppHeader /* render={() => <AppActions />} */>
      <Breadcrumb app={currentApp as IWebApp}></Breadcrumb>
    </BaseAppHeader>
  );
};
