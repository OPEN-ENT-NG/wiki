import { TreeItem } from '@edifice.io/react';

/**
 * This function filters the current page and all its children from the tree data recursively
 * @param nodes the current nodes to filter
 * @param pageId the page id to filter
 * @returns the tree data without the current page and its children
 */
const filterTreeData = (nodes: TreeItem[], pageId: string) => {
  return nodes.filter((node) => {
    if (node.id === pageId) return false;
    const copy = { ...node };
    if (copy.children) {
      copy.children = [...filterTreeData(copy.children, pageId)];
    }
    return true;
  });
};
/**
 * This hook filters the current page and all its children from the tree data
 * @param rootNodes The root nodes of the tree data
 * @param pageId The id of the current page to filter
 * @returns The filtered tree data without the current page and its children
 */
export const useFilterCurrentPageFromTree = (
  rootNodes: TreeItem[],
  pageId: string,
) => {
  return filterTreeData(rootNodes, pageId);
};
