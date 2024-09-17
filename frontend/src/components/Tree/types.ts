import { UniqueIdentifier } from '@dnd-kit/core';
import { ComponentPropsWithRef } from 'react';

export type TreeItem = {
  id: string;
  name: string;
  section?: boolean;
  children?: TreeItem[];
};

export interface TreeProps extends SharedTreeProps {
  /**
   * Tree data
   */
  nodes: TreeItem[];
  /**
   * Expand all nodes
   */
  shouldExpandAllNodes?: boolean;
  /**
   * Callback function to provide folded item to parent component
   */
  onTreeItemFold?: (nodeId: string) => void;

  /**
   * Callback function to provide unfolded item to parent component
   */
  onTreeItemUnfold?: (nodeId: string) => void;
  /**
   * Callback function to secondary action
   */
  onTreeItemAction?: (nodeId: string) => void;
}

export interface DndTreeProps extends TreeProps {
  /**
   * Pass draggeNode when you drag an element from another context (resource / folder)
   */
  draggedNode?: {
    isOver: boolean;
    overId: string | undefined;
    isTreeview: boolean;
  };
}

export interface SortableTreeProps extends TreeProps {
  /**
   *
   * @param id
   * @returns disable a specific node or the whole tree
   * disable a specific node: (nodeId) => disabledIds.includes(nodeId)
   * disable sorting: () => true
   */
  isDisabled?: (id: UniqueIdentifier) => boolean;
  /**
   *
   * @param nodeId dropped node
   * @param parentId current parentId or new parentId if move inside a new item
   * @returns gets nodeId and parentId to update via a service
   */
  onSortable: ({
    nodeId,
    parentId,
  }: {
    nodeId: string | UniqueIdentifier;
    parentId: string | null;
  }) => void;
}

export interface SharedTreeProps {
  /**
   * Customize the JSX we render inside a node
   */
  renderNode?: (payload: {
    nodeId: string;
    nodeName: string;
    hasChildren: boolean;
  }) => React.ReactNode;
  /**
   * Show Section Icon
   */
  showIcon?: boolean;
  /**
   * Node ID used for synchronization
   */
  selectedNodeId?: string | null;
  /**
   * Callback function to provide selected item to parent component
   */
  onTreeItemClick: (nodeId: string) => void;
}

export interface TreeNodeProps
  extends ComponentPropsWithRef<'li'>,
    SharedTreeProps {
  /**
   * Node data
   */
  node: TreeItem;
  /**
   * Is dragging element
   */
  focused?: boolean
  /**
   * Use to disable sorting, check SortableTreeProps
   */;
  disabled?: boolean;
  /**
   * Nodes expanded (opened)
   */
  expandedNodes: Set<string>;
  /**
   * Function to fold / unfold node
   */
  onToggleNode?: (nodeId: string) => void;
}

export interface DndTreeNodeProps extends TreeNodeProps {
  /**
   * Id of draggable node
   */
  draggedNodeId?: string | undefined;
}

export interface SortableTreeNodeProps extends TreeNodeProps {
  /**
   * Use to disable sorting, check SortableTreeProps
   */
  disabled?: boolean;
}

export interface FlattenedItem extends TreeItem {
  parentId: string | null;
}

export interface TreeViewHandlers {
  unselect: () => void;
  select: (nodeId: string) => void;
}
