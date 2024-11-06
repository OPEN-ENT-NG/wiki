import { RightRole } from 'edifice-ts-client';
import { Page, Wiki } from '~/models';
import { sortPagesByPosition } from './sortPagesByPosition';

type UserRights = Record<RightRole, boolean>;

export const findDefaultPage = (
  wiki: Wiki,
  userRights: UserRights,
): Page | undefined => {
  const { pages } = wiki;
  const sortedPages = sortPagesByPosition(pages);
  const firstPage = sortedPages[0];

  // Return the first page if the user is a manager or if it's visible.
  if (firstPage && (userRights.manager || firstPage.isVisible)) {
    return firstPage;
  }

  // Return the first page if user is a manager or the first visible page
  return userRights.manager ? pages[0] : pages.find((page) => page.isVisible);
};
