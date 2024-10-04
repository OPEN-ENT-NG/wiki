import { Plus, TextPage } from '@edifice-ui/icons';
import { Dropdown, IconButtonProps, Menu } from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { RefAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tree } from '~/components/Tree/Tree';
import { useMenu } from '~/hooks/useMenu';
import { useTreeActions, useTreeData, useUserRights } from '~/store';

export const DropdownTreeview = ({
  selectedNodeId,
  onTreeItemClick,
  onTreeItemAction,
}: {
  selectedNodeId?: string | null;
  onTreeItemClick: (pageId: ID) => void;
  onTreeItemAction?: (pageId: ID) => void;
}) => {
  const treeData = useTreeData();
  const userRights = useUserRights();
  const navigate = useNavigate();

  const { setSelectedNodeId } = useTreeActions();
  const { data: menu, handleOnMenuClick } = useMenu({
    onMenuClick: setSelectedNodeId,
  });

  const isOnlyRead =
    userRights.read &&
    !userRights.contrib &&
    !userRights.creator &&
    !userRights.manager;

  const handleOnTreeItemCreateChildren = (pageId: ID) =>
    navigate(`page/${pageId}/subpage/create`);

  return (
    <div className="dropdown-treeview w-100 mb-16">
      <Dropdown block>
        {(
          _triggerProps: JSX.IntrinsicAttributes &
            Omit<IconButtonProps, 'ref'> &
            RefAttributes<HTMLButtonElement>,
          _itemRefs,
          setVisible,
        ) => (
          <>
            <Dropdown.Trigger label="Pages" icon={<TextPage />} />
            <Dropdown.Menu
              onClick={() => {
                setVisible(false);
              }}
            >
              <Menu label={menu.children}>
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
              <Dropdown.Separator />
              <Tree
                nodes={treeData}
                selectedNodeId={selectedNodeId}
                shouldExpandAllNodes
                onTreeItemClick={(pageId) => {
                  onTreeItemClick(pageId);
                  setVisible(false);
                }}
                renderNode={({ nodeId, nodeName }) => (
                  <div className="d-flex flex-fill align-items-center justify-content-between">
                    <span>{nodeName}</span>
                    <button
                      className="tree-btn mx-8"
                      onClick={
                        !isOnlyRead
                          ? (event) => {
                              event.stopPropagation();
                              handleOnTreeItemCreateChildren(nodeId);
                            }
                          : undefined
                      }
                    >
                      <Plus height={16} width={16} />
                    </button>
                  </div>
                )}
              />
            </Dropdown.Menu>
          </>
        )}
      </Dropdown>
    </div>
  );
};
