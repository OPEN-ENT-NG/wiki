import { TreeData } from '@edifice-ui/react';
import { FOLDER } from 'edifice-ts-client';
import { useStore } from 'zustand';

import { createStore } from 'zustand/vanilla';

/**
 * https://doichevkostia.dev/blog/authentication-store-with-zustand/
 */

interface State {
  treeData: TreeData[];
  nodeIdActif: string;
}

type Action = {
  actions: {
    setTreeData: (treeData: TreeData[]) => void;
    setNodeIdActif: (nodeIdActif: string) => void;
  };
};

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

const initialState = {
  treeData: [
    {
      id: FOLDER.DEFAULT,
      name: 'default',
      section: true,
      children: [],
    },
  ],
  nodeIdActif: '',
};

const store = createStore<State & Action>()((set, get) => ({
  ...initialState,
  actions: {
    setTreeData: (treeData: TreeData[]) => set(() => ({ treeData })),
    setNodeIdActif: (nodeIdActif: string) => set(() => ({ nodeIdActif })),
  },
}));

// Selectors
const treeData = (state: ExtractState<typeof store>) => state.treeData;
const nodeIdActif = (state: ExtractState<typeof store>) => state.nodeIdActif;
const actionsSelector = (state: ExtractState<typeof store>) => state.actions;

// Getters
export const getTreeData = () => treeData(store.getState());
export const getTreeActions = () => actionsSelector(store.getState());

// React Store
function useTreeStore<U>(selector: Params<U>[1]) {
  return useStore(store, selector);
}

// Hooks
export const useTreeData = () => useTreeStore(treeData);
export const useNodeIdActif = () => useTreeStore(nodeIdActif);
export const useTreeActions = () => useTreeStore(actionsSelector);
