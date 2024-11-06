import { useUser } from '@edifice-ui/react';
import { useParams } from 'react-router-dom';
import { useGetPagesFromWiki } from '~/services';
import { useSelectedPages, useUserRights } from '~/store';
/**
 * Hook to check if the user is the author of the page or a manager of the wiki or the selected page
 * @returns { isManagerOfWiki: boolean, isManagerOfPage: boolean }
 */
export const useIsAuthorOrManager = () => {
  // get params
  const params = useParams();
  // get user
  const { user } = useUser();
  // get user rights
  const userRights = useUserRights();
  // get pages from wiki
  const { data } = useGetPagesFromWiki({
    wikiId: params.wikiId!,
    content: false,
  });
  const selectedPage = useSelectedPages();
  // check if user is manager of the wiki
  const isManagerOfWiki = userRights.creator || userRights.manager;
  // check if user is manager of the selected page
  const isManagerOfSelectedPage = selectedPage.every((pageId) => {
    const pageData = data?.find((p) => p._id === pageId);
    return pageData?.author === user?.userId;
  });
  // return if user is manager of the page or wiki
  return { isManagerOfWiki, isManagerOfSelectedPage };
};
