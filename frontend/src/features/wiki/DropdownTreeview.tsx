import { TextPage } from '@edifice-ui/icons';
import {
  Dropdown,
  IconButtonProps,
  TreeData,
  TreeView,
} from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { RefAttributes } from 'react';

export const DropdownTreeview = ({
  treeData,
  selectedNodeId,
  onTreeItemClick,
  onTreeItemAction,
}: {
  treeData: TreeData[];
  selectedNodeId: string | undefined;
  onTreeItemAction: (pageId: ID) => void;
  onTreeItemClick: (pageId: ID) => void;
}) => {
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
