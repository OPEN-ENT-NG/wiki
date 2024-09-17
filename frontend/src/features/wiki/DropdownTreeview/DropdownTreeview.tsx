import { TextPage } from '@edifice-ui/icons';
import { Dropdown, IconButtonProps, Menu } from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { RefAttributes } from 'react';
import { Tree } from '~/components/Tree/Tree';
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
  const { setSelectedNodeId } = useTreeActions();
  const { data: menu, handleOnMenuClick } = useMenu({
    onMenuClick: setSelectedNodeId,
  });

  return (
    <div className="dropdown-treeview w-100 mb-16">
      <Dropdown block>
        {(
          triggerProps: JSX.IntrinsicAttributes &
            Omit<IconButtonProps, 'ref'> &
            RefAttributes<HTMLButtonElement>,
          itemRefs,
          setVisible
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
                /* onTreeItemAction={
                  !isOnlyRead ? handleOnTreeItemCreateChildren : undefined
                } */
              />
            </Dropdown.Menu>
          </>
        )}
      </Dropdown>
    </div>
  );
};
