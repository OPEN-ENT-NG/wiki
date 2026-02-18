import { useContext } from 'react';
import { WikiAppContext } from './WikiAppProvider.context';

export const useWikiAppContext = () => {
  const context = useContext(WikiAppContext);

  if (!context) {
    throw new Error('useWikiAppContext must be used within a WikiAppProvider');
  }

  return context;
};
