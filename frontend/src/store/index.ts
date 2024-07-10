import { TreeNode } from '@edifice-ui/react';
import { FOLDER } from 'edifice-ts-client';
import { create } from 'zustand';

interface State {
  treeData: TreeNode[];
}

type Action = {
  setTreeData: (treeData: TreeNode[]) => void;
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
  setTreeData: (treeData: TreeNode[]) => set(() => ({ treeData })),
}));

export const useTreeData = () => useStoreContext((state) => state.treeData);
