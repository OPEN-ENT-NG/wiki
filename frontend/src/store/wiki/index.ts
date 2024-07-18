import { RightRole } from 'edifice-ts-client';
import { createStore, useStore } from 'zustand';

type UserRights = Record<RightRole, boolean>;

/**
 * Basic store for managing "rights" array
 * Use this store with `checkUserRight` utils
 * You can check rights in a react-router loader
 * And set userRights with the store to get a stable global state
 * 
 * const userRights = await checkUserRight(rights);
  const { setUserRights } = useUserRightsStore.getState();
  setUserRights(userRights);
 */
interface State {
  openUpdateModal: boolean;
  openShareModal: boolean;
}

type Action = {
  actions: {
    setOpenUpdateModal: (value: boolean) => void;
    setOpenShareModal: (value: boolean) => void;
  };
};

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

const initialState = {
  openUpdateModal: false,
  openShareModal: false,
};

const store = createStore<State & Action>()((set, get) => ({
  ...initialState,
  actions: {
    setOpenUpdateModal: (openUpdateModal: boolean) => set({ openUpdateModal }),
    setOpenShareModal: (openShareModal: boolean) => set({ openShareModal }),
  },
}));

// Selectors
const openUpdateModal = (state: ExtractState<typeof store>) =>
  state.openUpdateModal;
const openShareModal = (state: ExtractState<typeof store>) =>
  state.openShareModal;
const actionsSelector = (state: ExtractState<typeof store>) => state.actions;

// Getters
export const getOpenUpdateModal = () => openUpdateModal(store.getState());
export const getOpenShareModal = () => openShareModal(store.getState());
export const getWikiActions = () => actionsSelector(store.getState());

// React Store
function useWikiStore<U>(selector: Params<U>[1]) {
  return useStore(store, selector);
}

// Hooks
export const useOpenUpdateModal = () => useWikiStore(openUpdateModal);
export const useOpenShareModal = () => useWikiStore(openShareModal);
export const useWikiActions = () => useWikiStore(actionsSelector);
