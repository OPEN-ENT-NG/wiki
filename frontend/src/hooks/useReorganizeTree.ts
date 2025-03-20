import { TreeItem } from '@edifice.io/react';
import { UpdateTreeDataWithVisibility } from '~/models';
import { useFindTreeItemById } from './useFindTreeItemById';

interface ReorganizeTreeParams {
  currentPageId: string;
  destinationPageId: string;
  pages: TreeItem[];
}

/**
 * Hook to reorganize tree items when moving a page
 * @returns Function to reorganize pages recursively
 */
export const useReorganizeTree = () => {
  const { findParentNode, find } = useFindTreeItemById();
  /**
   * Function to reorganize pages recursively
   * @param pages current pages to reorganize
   * @param currentPage current page to move
   * @param destinationPage destination page to move to
   * @returns reorganized pages
   */
  const reorganizeRecursive = (
    pages: TreeItem[],
    currentPage: TreeItem,
    destinationPage: TreeItem,
    destinationPageParent?: TreeItem,
  ): TreeItem[] => {
    return pages.map((page) => {
      // Create a copy to avoid direct mutation
      const updatedPage = { ...page };

      // Recursively reorganize children if they exist
      if (updatedPage.children && updatedPage.children.length > 0) {
        updatedPage.children = reorganizeRecursive(
          updatedPage.children,
          currentPage,
          destinationPage,
        );
      }

      // Increment position by 2 for pages after destination
      if ((page.position ?? 0) > (destinationPage.position ?? 0)) {
        updatedPage.position = (page.position ?? 0) + 2;
      }

      // Update current page position and parent
      if (page.id === currentPage.id) {
        updatedPage.parentId = destinationPageParent?.id;
        updatedPage.position = (destinationPage.position ?? 0) + 1;
        // Reset children when moving the page
        updatedPage.children = currentPage.children;
        // Update children position
        (updatedPage.children ?? []).forEach((child, i) => {
          child.position = (updatedPage.position ?? 0) + i;
        });
      }
      return updatedPage;
    });
  };
  /**
   * Transform TreeItem array to UpdateTreeDataWithVisibility array
   * @param items TreeItem array to transform
   * @returns Flattened array of UpdateTreeDataWithVisibility
   */
  const transformToUpdateData = (
    items: TreeItem[],
  ): UpdateTreeDataWithVisibility[] => {
    const result: UpdateTreeDataWithVisibility[] = [];

    // Process each item recursively
    const processItem = (item: TreeItem, parent?: TreeItem) => {
      result.push({
        _id: item.id,
        // Set parentId to undefined if it is the root (typing need a parentId...)
        parentId: parent?.id ?? undefined!,
        position: item.position ?? 0,
        isVisible: item.isVisible,
      });

      // Recursively process children
      if (item.children?.length) {
        item.children.forEach((element) => processItem(element, item));
      }
    };

    items.forEach((element) => processItem(element));
    return result;
  };
  const reorganize = ({
    currentPageId,
    destinationPageId,
    pages,
  }: ReorganizeTreeParams) => {
    const currentPage = find(pages, currentPageId);
    const destinationPage = find(pages, destinationPageId);
    if (!currentPage) {
      throw new Error('Current page not found');
    }
    if (!destinationPage) {
      throw new Error('Destination page not found');
    }
    // Find parent of destination page
    const destinationPageParent = findParentNode(pages, destinationPageId);
    // Reorganize pages recursively
    const reorganizePages = reorganizeRecursive(
      pages,
      currentPage,
      destinationPage,
      destinationPageParent,
    );
    // Switch parent of destination page
    // Find currentPage in reorganized pages
    const child = find(reorganizePages, currentPage.id);
    if (child) {
      // Remove current page from old parent
      const oldParent = findParentNode(reorganizePages, currentPage.id);
      if (oldParent) {
        oldParent.children = oldParent.children?.filter(
          (child) => child.id !== currentPage.id,
        );
      }
      // Remove current page from root
      reorganizePages.splice(
        reorganizePages.findIndex((page) => page.id === currentPage.id),
        1,
      );
      // Add current page to destination page children
      if (destinationPageParent) {
        const newParent = find(reorganizePages, destinationPageParent?.id);
        if (newParent) {
          newParent.children = [...(newParent.children ?? []), child];
        }
      } else {
        // If destination page is root, add current page to root
        reorganizePages.push(child);
      }
    }
    return reorganizePages;
  };

  return {
    reorganize,
    transformToUpdateData,
  };
};
