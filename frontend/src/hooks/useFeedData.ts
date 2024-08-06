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
      const filteredPages = data.pages.filter((page) => !page.parentId);

      setTreeData(
        filteredPages.map((page) => {
          if (page.children) {
            const childPages = page.children.map((child) => {
              return {
                id: child._id,
                name: child.title,
              };
            });
            return {
              id: page._id,
              name: page.title,
              section: true,
              children: childPages,
            };
          }
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
