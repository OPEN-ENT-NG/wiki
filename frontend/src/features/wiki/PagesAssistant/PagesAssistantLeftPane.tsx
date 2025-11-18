import { SortableTree } from '@edifice.io/react';

// TODO: Implement the full Pages Assistant left pane functionality
export const PagesAssistantLeftPane = () => {
  const treeData = [
    {
      id: '1',
      name: 'Création libre',
      title: 'Getting Started with Pages Assistant',
    },
  ];

  return (
    <SortableTree
      nodes={treeData}
      selectedNodeId="1"
      renderNode={({ node }) => (
        <div
          className="d-flex flex-fill align-items-center justify-content-between"
          style={{ width: '100%' }}
        >
          <span className="text-truncate">{node.name}</span>
        </div>
      )}
      onSortable={() => {}}
      onTreeItemClick={() => {}}
    />
  );
};
