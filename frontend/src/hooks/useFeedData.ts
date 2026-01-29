import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '~/models';
import { useGetWiki } from '~/services';
import { useTreeActions } from '~/store';
import { getChildrenRecursively } from '~/utils/getChildrenRecursively';
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
            //TODO instead of flattening the tree, we should break parent children relationship at level 2 when moving a page
            // Get all children of the page recursively (flatten the tree because we display only 2 levels)
            const childPages = getChildrenRecursively({
              page,
              filterPage: filterVisiblePage,
              allPages: data.pages,
            });
            // exclude the page itself from the children
            delete childPages[page._id];

            return {
              id: page._id,
              name: page.title,
              section: true,
              position: page.position,
              isVisible: page.isVisible,
              children: Object.values(childPages)
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
              aiMetadata: {
                contentGenerated: page.aiMetadata?.contentGenerated || false,
                contentGeneratedDate:
                  page.aiMetadata?.contentGeneratedDate || undefined,
              },
            };
          }
          return {
            id: page._id,
            name: page.title,
            section: true,
            position: page.position,
            isVisible: page.isVisible,
            aiMetadata: {
              contentGenerated: page.aiMetadata?.contentGenerated || false,
              contentGeneratedDate:
                page.aiMetadata?.contentGeneratedDate || undefined,
            },
          };
        });

      setTreeData(
        newTree
          .slice()
          .sort(
            (a, b) =>
              (a.position ?? newTree.length) - (b.position ?? newTree.length),
          ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
};
