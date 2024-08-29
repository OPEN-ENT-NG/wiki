import { createStore, useStore } from 'zustand';

interface State {
  openUpdateModal: boolean;
  openShareModal: boolean;
  openDeleteModal: boolean;
  openVersionsModal: boolean;
  openConfirmVisibilityModal: boolean;
}

type Action = {
  actions: {
    setOpenUpdateModal: (value: boolean) => void;
    setOpenShareModal: (value: boolean) => void;
    setOpenDeleteModal: (value: boolean) => void;
    setOpenVersionsModal: (value: boolean) => void;
    setOpenConfirmVisibilityModal: (value: boolean) => void;
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
  openDeleteModal: false,
  openVersionsModal: false,
  openConfirmVisibilityModal: false,
};

const store = createStore<State & Action>()((set, get) => ({
  ...initialState,
  actions: {
    setOpenUpdateModal: (openUpdateModal: boolean) => set({ openUpdateModal }),
    setOpenShareModal: (openShareModal: boolean) => set({ openShareModal }),
    setOpenDeleteModal: (openDeleteModal: boolean) => set({ openDeleteModal }),
    setOpenVersionsModal: (openVersionsModal: boolean) =>
      set({ openVersionsModal }),
    setOpenConfirmVisibilityModal: (openConfirmVisibilityModal: boolean) =>
      set({ openConfirmVisibilityModal }),
  },
}));

// Selectors
const openUpdateModal = (state: ExtractState<typeof store>) =>
  state.openUpdateModal;
const openShareModal = (state: ExtractState<typeof store>) =>
  state.openShareModal;
const openDeleteModal = (state: ExtractState<typeof store>) =>
  state.openDeleteModal;
const openVersionsModal = (state: ExtractState<typeof store>) =>
  state.openVersionsModal;
const openConfirmVisibilityModal = (state: ExtractState<typeof store>) =>
  state.openConfirmVisibilityModal;
const actionsSelector = (state: ExtractState<typeof store>) => state.actions;

// Getters
export const getOpenUpdateModal = () => openUpdateModal(store.getState());
export const getOpenShareModal = () => openShareModal(store.getState());
export const getOpenDeleteModal = () => openDeleteModal(store.getState());
export const getOpenVersionsModal = () => openVersionsModal(store.getState());
export const getOpenConfirmVisibilityModal = () =>
  openConfirmVisibilityModal(store.getState());
export const getWikiActions = () => actionsSelector(store.getState());

// React Store
function useWikiStore<U>(selector: Params<U>[1]) {
  return useStore(store, selector);
}

// Hooks
export const useOpenUpdateModal = () => useWikiStore(openUpdateModal);
export const useOpenShareModal = () => useWikiStore(openShareModal);
export const useOpenDeleteModal = () => useWikiStore(openDeleteModal);
export const useOpenVersionsModal = () => useWikiStore(openVersionsModal);
export const useOpenConfirmVisibilityModal = () =>
  useWikiStore(openConfirmVisibilityModal);
export const useWikiActions = () => useWikiStore(actionsSelector);
