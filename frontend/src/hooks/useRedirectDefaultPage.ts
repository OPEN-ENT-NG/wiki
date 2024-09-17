import { useEffect } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';

export const useRedirectDefaultPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const match = useMatch('/id/:wikiId');

  const { data } = useGetWiki(params.wikiId!);

  useEffect(() => {
    if (match && data && !!data.pages.length) {
      const findIndexPage = data.pages.find((page) => page._id === data.index);
      const firstPage = data.pages[0];

      if (findIndexPage) {
        const pageId = findIndexPage?._id;
        return navigate(`/id/${data?._id}/page/${pageId}`);
      } else {
        return navigate(`/id/${data?._id}/page/${firstPage._id}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, match]);
};
