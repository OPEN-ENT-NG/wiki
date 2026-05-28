import { createContext } from 'react';
import { AdditionalActions } from '../WikiApp';

export interface WikiAppContextProps {
  wikiId?: string;
  header?: boolean;
  additionalActions?: AdditionalActions;
}

export const WikiAppContext = createContext<WikiAppContextProps | null>(null);
