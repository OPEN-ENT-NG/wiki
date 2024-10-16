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
      const newTree = data.pages
        .filter((page) => filterParentPage(page) && filterVisiblePage(page))
        .map((page) => {
          if (page.children) {
            const childPages = page.children
              .filter((child) => filterVisiblePage(child as Page))
              .map((child) => {
                return {
                  id: child._id,
                  name: child.title,
                  isVisible: child.isVisible,
                  position: child.position,
                };
              });
            return {
              id: page._id,
              name: page.title,
              section: true,
              position: page.position,
              children: childPages
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
            };
          }
          return {
            id: page._id,
            name: page.title,
            section: true,
            position: page.position,
          };
        });

      setTreeData(
        newTree.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
};
