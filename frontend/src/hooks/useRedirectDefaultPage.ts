import { useEffect } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';
import { useUserRights } from '~/store';
import { findDefaultPage } from '~/utils/findDefaultPage';

export const useRedirectDefaultPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const match = useMatch('/id/:wikiId');
  const userRights = useUserRights();

  const { data: wiki } = useGetWiki(params.wikiId!);

  useEffect(() => {
    if (match && wiki && !!wiki.pages.length) {
      const defaultPage = findDefaultPage(wiki, userRights);

      if (defaultPage) {
        return navigate(`/id/${wiki?._id}/page/${defaultPage._id}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wiki, match, userRights]);
};
