import { TreeNode } from '@edifice-ui/react';
import { FOLDER } from 'edifice-ts-client';
import { create } from 'zustand';

interface State {
  treeData: TreeNode[];
}

type Action = {
  updaters: {
    setTreeData: (treeData: TreeNode[]) => void;
  };
};

const initialState = {
  treeData: [
    {
      id: FOLDER.DEFAULT,
      name: 'default',
      section: true,
      children: [],
    },
  ],
};

export const useStoreContext = create<State & Action>((set) => ({
  ...initialState,
  updaters: {
    setTreeData: (treeData: TreeNode[]) => set(() => ({ treeData })),
  },
}));

export const useTreeData = () => useStoreContext((state) => state.treeData);

export const useStoreActions = () => useStoreContext((state) => state.updaters);
