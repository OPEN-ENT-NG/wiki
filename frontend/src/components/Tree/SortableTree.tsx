import {
  Announcements,
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  AnimateLayoutChanges,
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Folder, RafterRight } from '@edifice-ui/icons';
import clsx from 'clsx';
import { CSSProperties, forwardRef, Ref, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  FlattenedItem,
  SortableTreeProps,
  TreeItem,
  TreeNodeProps,
} from './types';
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
  const [items, setItems] = useState<TreeItem[]>(() => nodes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  /* useEffect(() => {
    if (nodes) setItems(nodes);
  }, [nodes]); */

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
    parentId: string | null,
    depth = 0
  ): FlattenedItem[] => {
    return tree.reduce((acc, node) => {
      acc.push({
        id: node.id,
        name: node.name,
        parentId: parentId ?? null,
        depth: depth ?? 0,
      });

      if (node.children && node.children.length > 0) {
        acc = acc.concat(flattenTree(node.children, node.id, depth + 1));
      }

      return acc;
    }, [] as FlattenedItem[]);
  };

  function getDragDepth(offset: number, indentationWidth: number) {
    return Math.round(offset / indentationWidth);
  }

  function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
    if (previousItem) {
      return previousItem.depth + 1;
    }

    return 0;
  }

  function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
    if (nextItem) {
      return nextItem.depth;
    }

    return 0;
  }

  function getMovementAnnouncement(
    eventName: string,
    activeId: UniqueIdentifier,
    overId?: UniqueIdentifier
  ) {
    if (overId && projected) {
      if (eventName !== 'onDragEnd') {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items, null, 0))
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: UniqueIdentifier | null = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement('onDragMove', active.id, over?.id);
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement('onDragOver', active.id, over?.id);
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement('onDragEnd', active.id, over?.id);
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  function getProjection(
    items: FlattenedItem[],
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    dragOffset: number,
    indentationWidth: number
  ) {
    const overItemIndex = items.findIndex(({ id }) => id === overId);
    const activeItemIndex = items.findIndex(({ id }) => id === activeId);
    const activeItem = items[activeItemIndex];
    const newItems = arrayMove(items, activeItemIndex, overItemIndex);
    const previousItem = newItems[overItemIndex - 1];
    const nextItem = newItems[overItemIndex + 1];
    const dragDepth = getDragDepth(dragOffset, indentationWidth);
    const projectedDepth = activeItem.depth + dragDepth;
    const maxDepth = getMaxDepth({
      previousItem,
    });
    const minDepth = getMinDepth({ nextItem });
    let depth = projectedDepth;

    if (projectedDepth >= maxDepth) {
      depth = maxDepth;
    } else if (projectedDepth < minDepth) {
      depth = minDepth;
    }

    return { depth, maxDepth, minDepth, parentId: getParentId() };

    function getParentId() {
      if (depth === 0 || !previousItem) {
        return null;
      }

      if (depth === previousItem.depth) {
        return previousItem.parentId;
      }

      if (depth > previousItem.depth) {
        return previousItem.id;
      }

      const newParent = newItems
        .slice(0, overItemIndex)
        .reverse()
        .find((item) => item.depth === depth)?.parentId;

      return newParent ?? null;
    }
  }

  const flattenedTree: FlattenedItem[] = useMemo(
    () => flattenTree(items, null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );
  const sortedIds = useMemo(
    () => flattenedTree.map(({ id }) => id),
    [flattenedTree]
  );

  const activationConstraint = {
    delay: 250,
    tolerance: 5,
  };

  const indicator = false;
  const indentationWidth = 64;

  const projected =
    activeId && overId
      ? getProjection(
          flattenedTree,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;

  /* const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth)
  ); */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    setActiveId(active.id as unknown as string);
    setOverId(active.id as unknown as string);

    const activeItem = flattenedTree.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId as unknown as string,
      });
    }
  }

  function handleDragMove({ delta, active, over }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver(event: DragEndEvent) {
    const { over } = event;

    setOverId(over?.id as unknown as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    const overIndex = flattenedTree.findIndex(({ id }) => id === over?.id);
    const activeIndex = flattenedTree.findIndex(({ id }) => id === active.id);
    const overTreeItem = flattenedTree[overIndex];
    const activeTreeItem = flattenedTree[activeIndex];

    if (active.id !== over?.id) {
      if (projected && projected.depth === 1) {
        flattenedTree[activeIndex] = {
          ...activeTreeItem,
          parentId: projected.parentId,
        };
      } else {
        flattenedTree[activeIndex] = {
          ...activeTreeItem,
          parentId:
            overTreeItem.parentId === activeTreeItem.parentId
              ? activeTreeItem.parentId
              : overTreeItem.parentId,
        };
      }
    } else {
      if (projected && projected.depth === 1) {
        flattenedTree[activeIndex] = {
          ...activeTreeItem,
          parentId: projected.parentId,
        };
      }
    }

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

  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  const activeItem = activeId
    ? flattenedTree.find(({ id }) => id === activeId)
    : null;

  const dropAnimationConfig: DropAnimation = {
    keyframes({ transform }) {
      return [
        { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
        {
          opacity: 0,
          transform: CSS.Transform.toString({
            ...transform.final,
            x: transform.final.x + 5,
            y: transform.final.y + 5,
          }),
        },
      ];
    },
    easing: 'ease-out',
    sideEffects({ active }) {
      active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: defaultDropAnimation.duration,
        easing: defaultDropAnimation.easing,
      });
    },
  };

  const adjustTranslate: Modifier = ({ transform }) => {
    return {
      ...transform,
      y: transform.y - 25,
    };
  };

  return (
    <div className="treeview">
      <ul role="tree" className="m-0 p-0">
        <DndContext
          accessibility={{ announcements }}
          // modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          sensors={sensors}
          measuring={measuring}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragMove={handleDragMove}
        >
          <SortableContext
            items={sortedIds}
            strategy={verticalListSortingStrategy}
          >
            {Array.isArray(items) &&
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
                  depth={
                    node.id === activeId && projected ? projected.depth : 0
                  }
                  indicator={indicator}
                  indentationWidth={indentationWidth}
                />
              ))}
          </SortableContext>
          {createPortal(
            <DragOverlay
              dropAnimation={dropAnimationConfig}
              modifiers={indicator ? [adjustTranslate] : undefined}
            >
              {activeId && activeItem ? (
                <DragOverlayItem
                  id={activeId}
                  depth={activeItem.depth}
                  indentationWidth={indentationWidth}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </ul>
    </div>
  );
};

const TreeNode = forwardRef(
  (
    {
      node,
      selectedNodeId,
      showIcon = false,
      expandedNodes,
      focused,
      disabled,
      indentationWidth,
      depth,
      indicator,
      renderNode,
      onTreeItemClick,
      onToggleNode,
      ...restProps
    }: TreeNodeProps,
    ref: Ref<HTMLLIElement>
  ) => {
    const { t } = useTranslation();

    const selected = selectedNodeId === node.id;
    const expanded = expandedNodes.has(node.id);

    const animateLayoutChanges: AnimateLayoutChanges = ({
      isSorting,
      wasDragging,
    }) => (isSorting || wasDragging ? false : true);

    const { listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({
        id: node.id,
        disabled,
        animateLayoutChanges,
      });

    const style: CSSProperties = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    const treeItemClasses = {
      action: clsx('action-container d-flex align-items-center gap-8 px-2', {
        'drag-focus': focused,
        'border border-secondary rounded rounded-2 shadow bg-white': isDragging,
      }),
      arrow: clsx({
        invisible: !Array.isArray(node.children) || node.children.length === 0,
      }),
      button: clsx('flex-fill d-flex align-items-center text-truncate gap-8', {
        'py-8': depth === 0,
        'py-4': depth === 1,
      }),
    };

    const handleItemKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();

        onTreeItemClick?.(node.id);
      }
    };

    const handleItemToggleKeyDown = (
      event: React.KeyboardEvent<HTMLDivElement>
    ) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();

        onToggleNode?.(node.id);
      }
    };

    return (
      <li
        ref={setNodeRef}
        key={node.id}
        id={`treeitem-${node.id}`}
        role="treeitem"
        aria-selected={selected}
        aria-expanded={expanded}
        style={
          {
            ...style,
            paddingLeft: isDragging ? `${indentationWidth * depth}px` : null,
          } as React.CSSProperties
        }
        {...listeners}
      >
        <div>
          <div className={treeItemClasses.action}>
            {node.children && node.children.length > 0 ? (
              <div
                className={treeItemClasses.arrow}
                tabIndex={0}
                role="button"
                onClick={() => onToggleNode?.(node.id)}
                onKeyDown={handleItemToggleKeyDown}
                aria-label={t('foldUnfold')}
              >
                <RafterRight
                  width={16}
                  style={{
                    transform: expanded ? 'rotate(90deg)' : '',
                  }}
                />
              </div>
            ) : (
              <div className="py-8 invisible"></div>
            )}

            {node.children && showIcon ? (
              <Folder title="folder" width={20} height={20} />
            ) : null}

            <div
              tabIndex={0}
              role="button"
              className={treeItemClasses.button}
              onClick={() => onTreeItemClick(node.id)}
              onKeyDown={handleItemKeyDown}
            >
              {renderNode ? (
                renderNode({
                  nodeId: node.id,
                  nodeName: node.name,
                  hasChildren:
                    Array.isArray(node.children) && !!node.children.length,
                })
              ) : (
                <div className="text-truncate">{node.name}</div>
              )}
            </div>
          </div>

          {expanded && node.children && !!node.children.length && (
            <ul role="group">
              {node.children?.map((node) => (
                <TreeNode
                  ref={ref}
                  node={node}
                  key={node.id}
                  showIcon={showIcon}
                  selectedNodeId={selectedNodeId}
                  expandedNodes={expandedNodes}
                  onTreeItemClick={onTreeItemClick}
                  onToggleNode={onToggleNode}
                  renderNode={renderNode}
                  indentationWidth={indentationWidth}
                  depth={depth + 1}
                />
              ))}
            </ul>
          )}
        </div>
      </li>
    );
  }
);

export const DragOverlayItem = forwardRef(
  (
    {
      id,
      depth,
      indentationWidth,
      ...props
    }: { id: string; depth: number; indentationWidth: number },
    ref: Ref<HTMLDivElement>
  ) => {
    return (
      <div
        ref={ref}
        {...props}
        className="opacity-0"
        style={{ cursor: 'grabbing' }}
      >
        <div
          className={clsx(
            'action-container d-flex align-items-center gap-8 px-2'
          )}
        >
          <div
            className={clsx(
              'flex-fill d-flex align-items-center text-truncate gap-8 py-8'
            )}
          >
            <span className="text-truncate">{id}</span>
          </div>
        </div>
      </div>
    );
  }
);
