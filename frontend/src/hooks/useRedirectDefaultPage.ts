import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';

export const useRedirectDefaultPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { data } = useGetWiki(params.wikiId!);

  useEffect(() => {
    if (data) {
      const findIndexPage = data.pages.find((page) => page._id === data.index);

      if (findIndexPage) {
        const pageId = findIndexPage?._id;
        return navigate(`/id/${data?._id}/page/${pageId}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
};
