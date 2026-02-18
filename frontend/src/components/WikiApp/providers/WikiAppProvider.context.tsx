import { createContext } from 'react';
import { WikiAction } from '../components/WikiApp';

export interface WikiAppContextProps {
  wikiId: string;
  header?: boolean;
  actions?: WikiAction[];
}

export const WikiAppContext = createContext<WikiAppContextProps | null>(null);
