import { Page, Wiki } from '~/models';

export const findLastPage = (
  wiki: Wiki,
  arg?: { beforePageId?: string },
): Page | undefined => {
  // get pages
  let pages = wiki.pages;
  // if beforePageId is provided, filter pages before the reference page
  if (arg?.beforePageId) {
    const referencePage = pages.find((page) => page._id === arg.beforePageId);
    if (referencePage) {
      pages = pages.filter(
        (page) => {
            // if the page is the reference page, skip it
            if(page._id === arg.beforePageId) {
                return false;
            }
            // check if the page is before the reference page
            return (page.position ?? 0) < (referencePage.position ?? 0);
        },
      );
    }
  }
  // return the last page
  return pages.sort((a, b) => (b.position ?? 0) - (a.position ?? 0))[0];
};
