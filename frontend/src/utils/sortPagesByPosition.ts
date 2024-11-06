import { Page } from '~/models';

export const sortPagesByPosition = (pages: Page[]) => {
  return [...pages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
};
