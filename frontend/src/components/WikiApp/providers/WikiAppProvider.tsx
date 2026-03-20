import { WikiAction } from '../WikiApp';
import { WikiAppContext } from './WikiAppProvider.context';

export interface WikiAppProviderProps {
  wikiId?: string;
  header?: boolean;
  actions?: WikiAction[];
  children: React.ReactNode;
}

export function WikiAppProvider({
  wikiId,
  header = true,
  actions = [],
  children,
}: WikiAppProviderProps) {
  return (
    <WikiAppContext.Provider value={{ wikiId, header, actions }}>
      {children}
    </WikiAppContext.Provider>
  );
}

export default WikiAppProvider;
