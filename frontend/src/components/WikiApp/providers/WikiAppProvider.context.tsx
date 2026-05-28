import { createContext } from 'react';
import { ActionDropdownMenuOptions } from '~/features';

export interface WikiAppContextProps {
  wikiId?: string;
  header?: boolean;
  actions?: ActionDropdownMenuOptions[];
}

export const WikiAppContext = createContext<WikiAppContextProps | null>(null);
