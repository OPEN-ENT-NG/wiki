import { Page } from '~/models';

export const sortPagesByDate = (pages: Page[]) => {
  return [...pages].sort((a, b) => b.modified.$date - a.modified.$date);
};
