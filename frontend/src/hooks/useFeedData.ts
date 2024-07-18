import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetWiki } from '~/services';
import { useTreeActions } from '~/store';

export const useFeedData = () => {
  const params = useParams();

  const { data } = useGetWiki(params.wikiId!);
  const { setTreeData } = useTreeActions();

  useEffect(() => {
    if (data) {
      setTreeData(
        data.pages.map((page) => {
          return {
            id: page._id,
            name: page.title,
            section: true,
          };
        })
      );
    }
  }, [data, setTreeData]);
};
