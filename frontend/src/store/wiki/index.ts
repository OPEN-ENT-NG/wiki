import { createStore, useStore } from 'zustand';

interface ToastMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}
interface State {
  openUpdateModal: boolean;
  openShareModal: boolean;
  openDeleteModal: boolean;
  openRevisionModal: boolean;
  openConfirmVisibilityModal: boolean;
  openPrintModal: boolean;
  openDuplicateModal: boolean;
  toastMessages: ToastMessage[];
}

type Action = {
  actions: {
    setOpenUpdateModal: (value: boolean) => void;
    setOpenShareModal: (value: boolean) => void;
    setOpenDeleteModal: (value: boolean) => void;
    setOpenRevisionModal: (value: boolean) => void;
    setOpenConfirmVisibilityModal: (value: boolean) => void;
    setOpenPrintModal: (value: boolean) => void;
    setOpenDuplicateModal: (open: boolean) => void;
    addToastMessage: (message: Omit<ToastMessage, 'id'>) => void;
    clearToastMessages: () => void;
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
  openRevisionModal: false,
  openConfirmVisibilityModal: false,
  openPrintModal: false,
  openDuplicateModal: false,
  toastMessages: [] as ToastMessage[],
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
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
    addToastMessage: (message: Omit<ToastMessage, 'id'>) =>
      set((state) => ({
        toastMessages: [...state.toastMessages, { ...message }],
      })),
    clearToastMessages: () => set({ toastMessages: [] }),
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
const actionsSelector = (state: ExtractState<typeof store>) => state.actions;
const openDuplicateModal = (state: ExtractState<typeof store>) =>
  state.openDuplicateModal;

const toastMessagesSelector = (state: ExtractState<typeof store>) =>
  state.toastMessages;

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

// React Store
function useWikiStore<U>(selector: Params<U>[1]) {
  return useStore(store, selector);
}

// Hooks
export const useOpenUpdateModal = () => useWikiStore(openUpdateModal);
export const useOpenShareModal = () => useWikiStore(openShareModal);
export const useOpenDeleteModal = () => useWikiStore(openDeleteModal);
export const useOpenRevisionModal = () => useWikiStore(openRevisionModal);
export const useOpenConfirmVisibilityModal = () =>
  useWikiStore(openConfirmVisibilityModal);
export const useOpenPrintModal = () => useWikiStore(openPrintModal);
export const useOpenDuplicateModal = () => useWikiStore(openDuplicateModal);
export const useWikiActions = () => useWikiStore(actionsSelector);
export const useToastMessages = () => useWikiStore(toastMessagesSelector);
