import { createStore, useStore } from 'zustand';
interface State {
  openMoveModal: boolean;
  openUpdateModal: boolean;
  openShareModal: boolean;
  openDeleteModal: boolean;
  openRevisionModal: boolean;
  openConfirmVisibilityModal: boolean;
  openPrintModal: boolean;
  openDuplicateModal: boolean;
  selectedPages: string[];
  redirectingToDefaultPage: boolean;
}

type Action = {
  actions: {
    setOpenMoveModal: (value: boolean) => void;
    setOpenUpdateModal: (value: boolean) => void;
    setOpenShareModal: (value: boolean) => void;
    setOpenDeleteModal: (value: boolean) => void;
    setOpenRevisionModal: (value: boolean) => void;
    setOpenConfirmVisibilityModal: (value: boolean) => void;
    setOpenPrintModal: (value: boolean) => void;
    setOpenDuplicateModal: (open: boolean) => void;
    setSelectedPages: (selectedPages: string[]) => void;
    setRedirectingToDefaultPage: (redirectingToDefaultPage: boolean) => void;
  };
};

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

const initialState = {
  openMoveModal: false,
  openUpdateModal: false,
  openShareModal: false,
  openDeleteModal: false,
  openRevisionModal: false,
  openConfirmVisibilityModal: false,
  openPrintModal: false,
  openDuplicateModal: false,
  selectedPages: [],
  redirectingToDefaultPage: false,
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setOpenMoveModal: (openMoveModal: boolean) => set({ openMoveModal }),
    setOpenUpdateModal: (openUpdateModal: boolean) => set({ openUpdateModal }),
    setOpenShareModal: (openShareModal: boolean) => set({ openShareModal }),
    setOpenDeleteModal: (openDeleteModal: boolean) => set({ openDeleteModal }),
    setOpenRevisionModal: (openRevisionModal: boolean) =>
      set({ openRevisionModal }),
    setOpenConfirmVisibilityModal: (openConfirmVisibilityModal: boolean) =>
      set({ openConfirmVisibilityModal }),
    setOpenPrintModal: (openPrintModal: boolean) => set({ openPrintModal }),
    setOpenDuplicateModal: (openDuplicateModal: boolean) =>
      set({ openDuplicateModal }),
    setSelectedPages: (selectedPages: string[]) => set({ selectedPages }),
    setRedirectingToDefaultPage: (redirectingToDefaultPage: boolean) =>
      set({ redirectingToDefaultPage }),
  },
}));

// Selectors
const openUpdateModal = (state: ExtractState<typeof store>) =>
  state.openUpdateModal;
const openShareModal = (state: ExtractState<typeof store>) =>
  state.openShareModal;
const openDeleteModal = (state: ExtractState<typeof store>) =>
  state.openDeleteModal;
const openRevisionModal = (state: ExtractState<typeof store>) =>
  state.openRevisionModal;
const openConfirmVisibilityModal = (state: ExtractState<typeof store>) =>
  state.openConfirmVisibilityModal;
const openPrintModal = (state: ExtractState<typeof store>) =>
  state.openPrintModal;
const openMoveModal = (state: ExtractState<typeof store>) =>
  state.openMoveModal;
const actionsSelector = (state: ExtractState<typeof store>) => state.actions;
const openDuplicateModal = (state: ExtractState<typeof store>) =>
  state.openDuplicateModal;
const selectedPages = (state: ExtractState<typeof store>) =>
  state.selectedPages;
const redirectingToDefaultPage = (state: ExtractState<typeof store>) =>
  state.redirectingToDefaultPage;
// Getters
export const getOpenUpdateModal = () => openUpdateModal(store.getState());
export const getOpenShareModal = () => openShareModal(store.getState());
export const getOpenDeleteModal = () => openDeleteModal(store.getState());
export const getOpenRevisionModal = () => openRevisionModal(store.getState());
export const getOpenConfirmVisibilityModal = () =>
  openConfirmVisibilityModal(store.getState());
export const getOpenPrintModal = () => openPrintModal(store.getState());
export const getOpenDuplicateModal = () => openDuplicateModal(store.getState());
export const getWikiActions = () => actionsSelector(store.getState());
export const getSelectedPages = () => selectedPages(store.getState());
export const getRedirectingToDefaultPage = () =>
  redirectingToDefaultPage(store.getState());
export const getRedirectingToDefaultPageActions = () =>
  actionsSelector(store.getState());
// React Store
function useWikiStore<U>(selector: Params<U>[1]) {
  return useStore(store, selector);
}

// Hooks
export const useOpenMoveModal = () => useWikiStore(openMoveModal);
export const useOpenUpdateModal = () => useWikiStore(openUpdateModal);
export const useOpenShareModal = () => useWikiStore(openShareModal);
export const useOpenDeleteModal = () => useWikiStore(openDeleteModal);
export const useOpenRevisionModal = () => useWikiStore(openRevisionModal);
export const useOpenConfirmVisibilityModal = () =>
  useWikiStore(openConfirmVisibilityModal);
export const useOpenPrintModal = () => useWikiStore(openPrintModal);
export const useOpenDuplicateModal = () => useWikiStore(openDuplicateModal);
export const useSelectedPages = () => useWikiStore(selectedPages);
export const useWikiActions = () => useWikiStore(actionsSelector);
export const useRedirectingToDefaultPage = () =>
  useWikiStore(redirectingToDefaultPage);
