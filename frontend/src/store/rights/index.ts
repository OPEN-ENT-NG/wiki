import { create } from 'zustand';

type RightRole = 'contrib' | 'creator' | 'manager' | 'read';
type UserRights = Record<RightRole, boolean>;

interface UserRightsState {
  userRights: UserRights;
  setUserRights: (rights: UserRights) => void;
}

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
export const useUserRightsStore = create<UserRightsState>((set) => ({
  userRights: {
    creator: false,
    contrib: false,
    manager: false,
    read: false,
  },
  setUserRights: (rights: UserRights) => set({ userRights: rights }),
}));
