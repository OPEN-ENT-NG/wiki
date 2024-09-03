import {
  checkUserRight,
  Grid,
  Menu,
  TreeData,
  TreeView,
} from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { ID, odeServices } from 'edifice-ts-client';
import { useState } from 'react';
import {
  LoaderFunctionArgs,
  Outlet,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppHeader } from '~/features';
import { DropdownTreeview } from '~/features/wiki/DropdownTreeview';
import { NewPage } from '~/features/wiki/NewPage';
import WikiEmptyScreen from '~/features/wiki/WikiEmptyScreen';
import { useFeedData } from '~/hooks/useFeedData';
import { useMenu } from '~/hooks/useMenu';
import { useRedirectDefaultPage } from '~/hooks/useRedirectDefaultPage';
import { useGetWiki, wikiQueryOptions } from '~/services';
import { getUserRightsActions, useUserRights } from '~/store';
import {
  useSelectedNodeId,
  useTreeActions,
  useTreeData,
} from '~/store/treeview';
import './index.css';
import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  Modifier,
  PointerSensor,
  SensorContext,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );

    // TODO: wait normalized rights
    const userRights = await checkUserRight(data.rights);
    const { setUserRights } = getUserRightsActions();
    setUserRights(userRights);

    if (odeServices.http().isResponseError()) {
      throw new Response('', {
        status: odeServices.http().latestResponse.status,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    return data;
  };

export interface TreeItem {
  id: UniqueIdentifier;
  name: string;
  children: TreeItem[];
  collapsed?: boolean;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}

export const Index = () => {
  const params = useParams();
  const navigate = useNavigate();
  const treeData = useTreeData();
  const userRights = useUserRights();
  const selectedNodeId = useSelectedNodeId();
  const { setSelectedNodeId } = useTreeActions();
  const { setTreeData } = useTreeActions();
  const match = useMatch('/id/:wikiId');
  const menu = useMenu();
  const isSmallDevice = useMediaQuery('only screen and (max-width : 1023px)');
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [offsetLeft, setOffsetLeft] = useState(0);

  /* const sensorContext: SensorContext = useRef({
    items: treeData,
    offset: offsetLeft,
  });

  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth)
  ); */

  const { data } = useGetWiki(params.wikiId!);

  const isOnlyRead =
    userRights.read &&
    !userRights.contrib &&
    !userRights.creator &&
    !userRights.manager;

  /**
   * Redirect to the default page if exist
   */
  useRedirectDefaultPage();

  /**
   * Feed treeData
   */
  useFeedData();

  const handleOnTreeItemClick = (pageId: ID) => {
    navigate(`/id/${data?._id}/page/${pageId}`);
    setSelectedNodeId(pageId);
  };

  const handleOnMenuClick = () => {
    setSelectedNodeId('');
    menu.onClick();
  };

  const handleOnTreeItemCreateChildren = (pageId: ID) => {
    navigate(`page/${pageId}/subpage/create`);
  };

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

  const getAllIds = (data: TreeData[]): { id: string }[] => {
    const result: { id: string }[] = [];

    function traverse(items: any) {
      items.forEach((item: TreeData) => {
        result.push({ id: item.id });
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    }

    traverse(data);
    return result;
  };

  const allIds = getAllIds(treeData);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) {
      console.log(over.data.current?.node?.name);
      const overIndex = treeData.findIndex(({ id }) => id === over.id);
      const activeIndex = treeData.findIndex(({ id }) => id === active.id);

      const newTreeData = arrayMove(treeData, activeIndex, overIndex);

      setTreeData(newTreeData);
    }
  };

  const adjustTranslate: Modifier = ({ transform }) => {
    return {
      ...transform,
      y: transform.y - 25,
    };
  };

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  /* useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]); */

  return (
    <>
      <AppHeader />
      <Grid className="flex-grow-1">
        {!isSmallDevice && (
          <Grid.Col
            sm="3"
            lg="2"
            xl="3"
            className="border-end pt-16 pe-16 d-none d-lg-block"
            as="aside"
          >
            <Menu label={data ? data.title : ''}>
              <Menu.Item>
                <Menu.Button
                  onClick={handleOnMenuClick}
                  leftIcon={menu.leftIcon}
                  selected={menu.selected}
                >
                  {menu.children}
                </Menu.Button>
              </Menu.Item>
            </Menu>
            {!isOnlyRead && <NewPage />}
            {treeData && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
              >
                <SortableContext
                  items={allIds}
                  strategy={verticalListSortingStrategy}
                >
                  <TreeView
                    data={treeData}
                    showIcon={false}
                    selectedNodeId={selectedNodeId}
                    onTreeItemClick={handleOnTreeItemClick}
                    onTreeItemAction={
                      !isOnlyRead ? handleOnTreeItemCreateChildren : undefined
                    }
                  />
                  {createPortal(
                    <DragOverlay
                      dropAnimation={dropAnimationConfig}
                      modifiers={[adjustTranslate]}
                    >
                      <div>Coucou</div>
                    </DragOverlay>,
                    document.body
                  )}
                </SortableContext>
              </DndContext>
            )}
          </Grid.Col>
        )}
        <Grid.Col
          sm="4"
          md="8"
          lg="6"
          xl="9"
          className={clsx({
            'mt-16 mt-lg-0 mx-lg-0': isSmallDevice,
            'ms-n16 ms-lg-n24 me-n16': !isSmallDevice,
            'd-flex': match && !isSmallDevice,
          })}
        >
          {isSmallDevice && (
            <>
              <DropdownTreeview
                treeData={treeData}
                selectedNodeId={selectedNodeId}
                onTreeItemClick={handleOnTreeItemClick}
                onTreeItemAction={
                  !isOnlyRead ? handleOnTreeItemCreateChildren : undefined
                }
              />
              {!isOnlyRead && <NewPage />}
            </>
          )}
          {match ? <WikiEmptyScreen /> : <Outlet />}
        </Grid.Col>
      </Grid>
    </>
  );
};
