import { useStore } from 'zustand';

import { createStore } from 'zustand/vanilla';
import { TreeItem } from '~/components/Tree/types';

/**
 * https://doichevkostia.dev/blog/authentication-store-with-zustand/
 */

interface State {
  treeData: TreeItem[];
  selectedNodeId: string | null;
}

type Action = {
  actions: {
    setTreeData: (treeData: TreeItem[]) => void;
    setSelectedNodeId: (selectedNodeId: string | null) => void;
  };
};

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

const initialState = {
  treeData: [],
  selectedNodeId: null,
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setTreeData: (treeData) => set(() => ({ treeData })),
    setSelectedNodeId: (selectedNodeId) => set(() => ({ selectedNodeId })),
  },
}));

// Selectors
const treeData = (state: ExtractState<typeof store>) => state.treeData;
const selectedNodeId = (state: ExtractState<typeof store>) =>
  state.selectedNodeId;
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
export const useSelectedNodeId = () => useTreeStore(selectedNodeId);
export const useTreeActions = () => useTreeStore(actionsSelector);
