import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';

export const useRedirectDefaultPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { data } = useGetWiki(params.wikiId!);

  useEffect(() => {
    if (data && data.pages) {
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
  }, [data]);
};
