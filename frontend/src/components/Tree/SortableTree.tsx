import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import clsx from 'clsx';
import { forwardRef, Ref, useEffect, useState } from 'react';
import { TreeNode } from './Tree';
import { FlattenedItem, SortableTreeProps, TreeItem } from './types';
import { useTreeView } from './useTreeView';

export const SortableTree = ({
  nodes,
  selectedNodeId: externalSelectedNodeId,
  showIcon = false,
  shouldExpandAllNodes = false,
  renderNode,
  isDisabled = () => false,
  onTreeItemClick,
  onSortable,
}: SortableTreeProps) => {
  const [items, setItems] = useState<TreeItem[]>([]);
  const [, setActiveId] = useState<string | null>(null);
  const [, setOverId] = useState<string | null>(null);

  useEffect(() => {
    if (nodes) setItems(nodes);
  }, [nodes]);

  const { selectedNodeId, expandedNodes, handleItemClick, handleFoldUnfold } =
    useTreeView({
      data: nodes,
      externalSelectedNodeId,
      // draggedNode,
      shouldExpandAllNodes,
      onTreeItemClick,
      // onTreeItemFold,
      // onTreeItemUnfold,
    });

  const buildTree = (flatNodes: FlattenedItem[]): TreeItem[] => {
    const nodeMap = new Map<string, TreeItem>();

    // Initialiser la map avec chaque nœud
    flatNodes.forEach((node) => {
      nodeMap.set(node.id, { id: node.id, name: node.name, children: [] });
    });

    const tree: TreeItem[] = [];

    // Parcourir les nœuds et assigner les enfants à leur parent
    flatNodes.forEach((node) => {
      const treeNode = nodeMap.get(node.id)!; // Récupère le nœud correspondant
      if (node.parentId === null) {
        tree.push(treeNode); // Pas de parent, c'est un nœud racine
      } else {
        const parentNode = nodeMap.get(node.parentId);
        if (parentNode) {
          parentNode.children = parentNode.children ?? undefined;
          parentNode.children?.push(treeNode); // Ajoute le nœud en tant qu'enfant de son parent
        }
      }
    });

    return tree;
  };

  const flattenTree = (
    tree: TreeItem[],
    parentId: string | null
  ): FlattenedItem[] => {
    return tree.reduce((acc, node) => {
      acc.push({
        id: node.id,
        name: node.name,
        parentId,
      });

      if (node.children && node.children.length > 0) {
        acc = acc.concat(flattenTree(node.children, node.id));
      }

      return acc;
    }, [] as FlattenedItem[]);
  };

  const flattenedTree: FlattenedItem[] = flattenTree(nodes, null);
  const sortedIds = flattenedTree.map(({ id }) => id);

  const activationConstraint = {
    delay: 250,
    tolerance: 5,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    setActiveId(active.id);
  }

  function handleDragOver(event: DragEndEvent) {
    const { over } = event;

    setOverId(over?.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const overIndex = flattenedTree.findIndex(({ id }) => id === over?.id);
      const activeIndex = flattenedTree.findIndex(({ id }) => id === active.id);
      const overTreeItem = flattenedTree[overIndex];
      const activeTreeItem = flattenedTree[activeIndex];

      flattenedTree[activeIndex] = {
        ...activeTreeItem,
        parentId:
          overTreeItem.parentId === activeTreeItem.parentId
            ? activeTreeItem.parentId
            : overTreeItem.parentId,
      };

      const sortedItems = arrayMove(flattenedTree, activeIndex, overIndex);
      const buildedTree = buildTree(sortedItems);

      setItems(buildedTree);
      setActiveId(null);
      setOverId(null);

      onSortable({
        nodeId: active.id,
        parentId: flattenedTree[activeIndex].parentId,
      });
    }
  }

  return (
    <div className="treeview">
      <ul role="tree" className="m-0 p-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <SortableContext
            items={sortedIds}
            strategy={verticalListSortingStrategy}
          >
            {Array.isArray(nodes) &&
              items.map((node) => (
                <TreeNode
                  node={node}
                  key={node.id}
                  showIcon={showIcon}
                  expandedNodes={expandedNodes}
                  selectedNodeId={selectedNodeId}
                  renderNode={renderNode}
                  disabled={isDisabled(node.id)}
                  onTreeItemClick={handleItemClick}
                  onToggleNode={handleFoldUnfold}
                />
              ))}
          </SortableContext>
        </DndContext>
      </ul>
    </div>
  );
};

export const Item = forwardRef(
  ({ name, ...props }: { name: string }, ref: Ref<HTMLLIElement>) => {
    return (
      <li {...props} ref={ref}>
        <div>
          <div
            className={clsx(
              'action-container d-flex align-items-center gap-8 px-2'
            )}
          >
            <div
              className={clsx(
                'flex-fill d-flex align-items-center text-truncate gap-8'
              )}
            >
              <span className="text-truncate">{name}</span>
            </div>
          </div>
        </div>
      </li>
    );
  }
);
