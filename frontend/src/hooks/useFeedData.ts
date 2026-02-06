import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Created, Page } from '~/models';
import { useGetWiki } from '~/services';
import { useTreeActions } from '~/store';
import { getChildrenRecursively } from '~/utils/getChildrenRecursively';
import { useFilterVisiblePage } from './useFilterVisiblePage';

export interface FeedDataItem {
  id: string;
  name: string;
  section: boolean;
  position?: number;
  isVisible: boolean;
  aiMetadata?: {
    contentGenerated: boolean;
    contentGeneratedDate?: Created | undefined;
  };
  children?: {
    id: string;
    name: string;
    isVisible: boolean;
    position?: number;
  }[];
}

export const useFeedData = () => {
  const params = useParams();

  const { data } = useGetWiki(params.wikiId!);
  const { setTreeData } = useTreeActions();

  const filterVisiblePage = useFilterVisiblePage();
  const filterParentPage = (page: Page): boolean => !page.parentId;

  const newTree: FeedDataItem[] = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.pages
      .filter((page) => filterParentPage(page) && filterVisiblePage(page))
      .map((page) => {
        const filteredPage: FeedDataItem = {
          id: page._id,
          name: page.title,
          section: true,
          position: page.position,
          isVisible: page.isVisible,
        };
        const resultPage: FeedDataItem = filteredPage;

        // Add aiMetadata if exists
        if (page.aiMetadata) {
          resultPage.aiMetadata = {
            contentGenerated: page.aiMetadata?.contentGenerated || false,
            contentGeneratedDate:
              page.aiMetadata?.contentGeneratedDate || undefined,
          };
        }

        // Add children if exists
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

          resultPage.children = Object.values(childPages)
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        }
        return resultPage;
      });
  }, [data, filterVisiblePage]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setTreeData(
      newTree
        .slice()
        .sort(
          (a, b) =>
            (a.position ?? newTree.length) - (b.position ?? newTree.length),
        ),
    );
  }, [data, setTreeData]);
};
