import { TextPage } from '@edifice-ui/icons';
import {
  Dropdown,
  IconButtonProps,
  Menu,
  TreeData,
  TreeView,
} from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { RefAttributes } from 'react';
import { useMenu } from '~/hooks/useMenu';
import { useTreeActions } from '~/store';

export const DropdownTreeview = ({
  treeData,
  selectedNodeId,
  onTreeItemClick,
  onTreeItemAction,
}: {
  treeData: TreeData[];
  selectedNodeId: string | undefined;
  onTreeItemClick: (pageId: ID) => void;
  onTreeItemAction?: (pageId: ID) => void;
}) => {
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
              <TreeView
                data={treeData}
                showIcon={false}
                selectedNodeId={selectedNodeId}
                allExpandedNodes={true}
                onTreeItemClick={(pageId) => {
                  onTreeItemClick(pageId);
                  setVisible(false);
                }}
                onTreeItemAction={onTreeItemAction}
              />
            </Dropdown.Menu>
          </>
        )}
      </Dropdown>
    </div>
  );
};
