import { useUserRights } from '~/store';

export const useIsOnlyRead = () => {
  const userRights = useUserRights();

  const isOnlyRead =
    !userRights.contrib && !userRights.creator && !userRights.manager;

  return isOnlyRead;
};
