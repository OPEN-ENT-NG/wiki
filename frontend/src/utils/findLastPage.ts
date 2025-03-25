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
      // keep only pages before the reference page
      pages = pages.filter((page) => {
        // if the page is the reference page, skip it
        if (page._id === arg.beforePageId) {
          return false;
        }
        // check if the page is before the reference page
        return (page.position ?? 0) < (referencePage.position ?? 0);
      });
      // if the reference page is the first page, choose one page after the reference page
      if (pages.length === 0) {
        pages = wiki.pages.filter((page) => {
          // if the page is the reference page, skip it
          if (page._id === arg.beforePageId) {
            return false;
          }
          // if the page is a child of the reference page, skip it
          if (page.parentId === arg.beforePageId) {
            return false;
          }
          return true;
        });
        // return the first page
        return pages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];
      }
    }
  }
  // return the last page
  return pages.sort((a, b) => (b.position ?? 0) - (a.position ?? 0))[0];
};
