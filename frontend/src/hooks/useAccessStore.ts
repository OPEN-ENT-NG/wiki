import { useUserRightsStore } from '~/store';

export const useAccessStore = () => {
  const userRights = useUserRightsStore((state) => state.userRights);

  return { userRights };
};
