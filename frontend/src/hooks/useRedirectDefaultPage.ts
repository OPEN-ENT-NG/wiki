import { useEffect } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';
import {
  getRedirectingToDefaultPageActions,
  useRedirectingToDefaultPage,
  useUserRights,
} from '~/store';
import { findDefaultPage } from '~/utils/findDefaultPage';

export const useRedirectDefaultPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const match = useMatch('/id/:wikiId');
  const userRights = useUserRights();
  const { setRedirectingToDefaultPage } = getRedirectingToDefaultPageActions();
  const redirectingToDefaultPage = useRedirectingToDefaultPage();

  const { data: wiki } = useGetWiki(params.wikiId!);

  useEffect(() => {
    if (match && wiki && !!wiki.pages.length) {
      const defaultPage = findDefaultPage(wiki, userRights);
      // prevent infinite loop with loading state
      if (defaultPage && !redirectingToDefaultPage) {
        setRedirectingToDefaultPage(true);
        return navigate(`/id/${wiki?._id}/page/${defaultPage._id}`, {
          // replace: true prevents adding a new entry in the browser history
          // when redirecting to the default page
          replace: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wiki, match, userRights, redirectingToDefaultPage]);
};
