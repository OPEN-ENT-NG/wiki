import { SortableTree, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';

export const LeftPane = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  const treeData = [
    {
      id: '1',
      name: t('wiki.assistant.leftPane', { ns: appCode }),
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
