import { Hide, Plus, TextPage } from '@edifice-ui/icons';
import { Dropdown, IconButtonProps, Menu, Tree } from '@edifice-ui/react';
import clsx from 'clsx';
import { ID } from 'edifice-ts-client';
import { RefAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsOnlyRead } from '~/hooks/useIsOnlyRead';
import { useMenu } from '~/hooks/useMenu';
import { useTreeActions, useTreeData } from '~/store';

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
  const navigate = useNavigate();
  const isOnlyRead = useIsOnlyRead();

  const { setSelectedNodeId } = useTreeActions();
  const { data: menu, handleOnMenuClick } = useMenu({
    onMenuClick: setSelectedNodeId,
  });

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
                renderNode={({ node, isChild }) => (
                  <div
                    className="d-flex flex-fill align-items-center justify-content-between"
                    style={{ width: '100%' }}
                  >
                    <span className="text-truncate">{node.name}</span>

                    {(!node.isVisible || !isChild) && (
                      <span className="d-flex">
                        {!node.isVisible && (
                          <Hide
                            width="20"
                            height="20"
                            className={clsx({ 'me-8': isChild })}
                          />
                        )}
                        {!isChild && !isOnlyRead && (
                          <button
                            className="tree-btn mx-8"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOnTreeItemCreateChildren(node.id);
                            }}
                          >
                            <Plus height={16} width={16} />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                )}
                onTreeItemAction={onTreeItemAction}
              />
            </Dropdown.Menu>
          </>
        )}
      </Dropdown>
    </div>
  );
};
