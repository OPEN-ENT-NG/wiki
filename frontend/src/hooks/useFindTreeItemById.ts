import { TreeItem } from '@edifice.io/react';

/**
 * This function finds a tree item by its id recursively
 * @param nodes the current nodes to search
 * @param itemId the item id to find
 * @returns the found tree item with his parent or undefined if not found
 */
const findTreeItemById = (
  nodes: TreeItem[],
  itemId: string,
  parent?: TreeItem,
): { node: TreeItem; parent?: TreeItem } | undefined => {
  for (const node of nodes) {
    if (node.id === itemId) {
      return { node, parent };
    }
    if (node.children?.length) {
      const found = findTreeItemById(node.children, itemId, node);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

/**
 * This hook finds a tree item by its id in the tree data
 * @param rootNodes The root nodes of the tree data
 * @param itemId The id of the item to find
 * @returns The found tree item or undefined if not found
 */
export const useFindTreeItemById = () => {
  return {
    find: (rootNodes: TreeItem[], itemId: string) => {
      const result = findTreeItemById(rootNodes, itemId);
      return result?.node;
    },
    findParentNode: (rootNodes: TreeItem[], itemId: string) => {
      const result = findTreeItemById(rootNodes, itemId);
      return result?.parent;
    },
  };
};
