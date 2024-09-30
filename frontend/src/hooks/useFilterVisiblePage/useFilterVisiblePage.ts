import { Page } from '~/models';
import { useUserRights } from '~/store';

export const useFilterVisiblePage = () => {
  const userRights = useUserRights();

  const filterVisiblePage = (page: Page): boolean =>
    userRights.manager || page.isVisible;

  return filterVisiblePage;
};
