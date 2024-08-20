import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '~/models';
import { useGetWiki } from '~/services';
import { useTreeActions } from '~/store';
import { useFilterVisiblePage } from './useFilterVisiblePage';

export const useFeedData = () => {
  const params = useParams();

  const { data } = useGetWiki(params.wikiId!);
  const { setTreeData } = useTreeActions();

  const filterVisiblePage = useFilterVisiblePage();
  const filterParentPage = (page: Page): boolean => !page.parentId;

  useEffect(() => {
    if (data) {
      const filteredPages = data.pages.filter(
        (page) => filterParentPage(page) && filterVisiblePage(page)
      );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
};
