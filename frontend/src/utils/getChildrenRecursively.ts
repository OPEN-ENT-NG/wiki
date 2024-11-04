import { flattenTree, TreeItem } from '@edifice-ui/react';
import { Page } from '~/models';
type Child = {
  id: string;
  name: string;
  isVisible: boolean;
  position: number | undefined;
};
/**
 * Get all children of a page recursively (flatten the tree)
 * - Direct children
 * - Children of children
 * - Orphans (children of the page that have parentId equal to the page id)
 */
export const getChildrenRecursively = ({
  page,
  allPages,
  filterPage,
}: {
  page: Page;
  allPages: Page[];
  filterPage: (page: Page) => boolean;
}): Record<string, Child> => {
  const pageByIds: Record<string, Page> = {};
  // Transform a page to a tree item recursively
  const transformToTreeItemRecursively = (parent: Page): TreeItem => {
    pageByIds[parent._id] = parent;
    return {
      id: parent._id,
      name: parent.title,
      isVisible: parent.isVisible,
      position: parent.position,
      children:
        parent.children?.map((page) =>
          transformToTreeItemRecursively(page as Page),
        ) ?? [],
    };
  };
  // Flatten the tree
  const tree = flattenTree([transformToTreeItemRecursively(page)], page._id);
  // List of all children
  let allChildren: Record<string, Child> = {};
  // Add descendants to the list if filterPage is true
  for (const child of tree) {
    const page = pageByIds[child.id];
    if (filterPage(page)) {
      allChildren[page._id] = {
        id: page._id,
        name: page.title,
        isVisible: page.isVisible,
        position: page.position,
      };
    }
  }
  // Check if the child is in the allPages list
  const orphans = allPages.filter((p) => p.parentId === page._id);
  for (const orphan of orphans) {
    // add orphan to the list
    allChildren[orphan._id] = {
      id: orphan._id,
      name: orphan.title,
      isVisible: orphan.isVisible,
      position: orphan.position,
    };
    // Recursively add children of orphans
    allChildren = {
      ...allChildren,
      ...getChildrenRecursively({
        page: orphan,
        allPages,
        filterPage,
      }),
    };
  }
  return allChildren;
};
