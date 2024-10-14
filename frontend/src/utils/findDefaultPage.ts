import { RightRole } from 'edifice-ts-client';
import { Page, Wiki } from '~/models';

type UserRights = Record<RightRole, boolean>;

export const findDefaultPage = (
  wiki: Wiki,
  userRights: UserRights,
): Page | undefined => {
  const { pages, index } = wiki;
  const indexPage = pages.find((page) => page._id === index);

  // Return the index page if the user is a manager or if it's visible.
  if (indexPage && (userRights.manager || indexPage.isVisible)) {
    return indexPage;
  }

  // Return the first page if user is a manager or the first visible page
  return userRights.manager ? pages[0] : pages.find((page) => page.isVisible);
};
