import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import { App, odeServices } from 'edifice-ts-client';
import { useTranslation } from 'react-i18next';

export interface OdeProviderParams {
  alternativeApp?: boolean;
  app: App;
  cdnDomain?: string | null;
  version?: string | null;
}

export interface OdeClientProps {
  children: ReactNode;
  params: OdeProviderParams;
}

export interface OdeContextProps {
  appCode: App;
  init: boolean;
  /* applications: IWebApp[] | undefined;
  confQuery: UseQueryResult<IGetConf>;
  currentApp: IWebApp | undefined;
  currentLanguage: string | undefined;
  init: boolean;
  sessionQuery: UseQueryResult<IGetSession>;
  user: IUserInfo | undefined;
  userDescription: Partial<IUserDescription> | undefined;
  userProfile: UserProfile | undefined; */
}

export const OdeClientContext = createContext<OdeContextProps | null>(null!);

export function OdeClientProvider({ children, params }: OdeClientProps) {
  const appCode = params.app;

  const { t } = useTranslation();
  const translatedAppCode = t(appCode);

  // useSession();

  /* const sessionQuery = useSession();
  const confQuery = useConf({ appCode });

  const init = confQuery?.isSuccess && sessionQuery?.isSuccess; */

  /* useEffect(() => {
    document
      .querySelector('html')
      ?.setAttribute('lang', sessionQuery?.data?.currentLanguage || 'fr');
  }, [sessionQuery?.data]); */

  useEffect(() => {
    const getSession = async () => await odeServices.session().getSession();
    const getConf = async (code: string) =>
      await odeServices.conf().getConf(code);

    console.log('coucou');

    getSession().then((data) => console.log({ data }));
    getConf('wiki').then((conf) => console.log({ conf }));
  }, []);

  useEffect(() => {
    document.title = `${translatedAppCode}`;

    console.log('est');
  }, [appCode, translatedAppCode]);

  const values = useMemo(
    () => ({
      appCode,
      init: true,
      /* applications: confQuery?.data?.applications,
      confQuery,
      currentApp: confQuery?.data?.currentApp,
      currentLanguage: sessionQuery?.data?.currentLanguage,
      init,
      sessionQuery,
      user: sessionQuery?.data?.user,
      userDescription: sessionQuery?.data?.userDescription,
      userProfile: sessionQuery?.data?.userProfile, */
    }),
    [appCode]
  );

  return (
    <OdeClientContext.Provider value={values}>
      {children}
    </OdeClientContext.Provider>
  );
}

export function useOdeClient() {
  const context = useContext(OdeClientContext);

  if (!context) {
    throw new Error(`Cannot be used outside of OdeClientProvider`);
  }
  return context;
}
