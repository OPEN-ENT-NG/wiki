import { AdditionalActions } from '../WikiApp';
import { WikiAppContext } from './WikiAppProvider.context';

export interface WikiAppProviderProps {
  wikiId?: string;
  header?: boolean;
  additionalActions?: AdditionalActions;
  children: React.ReactNode;
}

export function WikiAppProvider({
  wikiId,
  header = true,
  additionalActions,
  children,
}: WikiAppProviderProps) {
  return (
    <WikiAppContext.Provider value={{ wikiId, header, additionalActions }}>
      {children}
    </WikiAppContext.Provider>
  );
}

export default WikiAppProvider;
