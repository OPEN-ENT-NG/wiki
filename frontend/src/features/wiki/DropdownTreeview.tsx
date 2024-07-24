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
  nodeId,
  handleClick,
}: {
  treeData: TreeData[];
  nodeId: string;
  handleClick: (pageId: ID) => void;
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
                selectedNodeId={nodeId}
                allExpandedNodes={true}
                onTreeItemClick={(pageId) => {
                  handleClick(pageId);
                  setVisible(false);
                }}
              />
            </Dropdown.Menu>
          </>
        )}
      </Dropdown>
    </div>
  );
};
