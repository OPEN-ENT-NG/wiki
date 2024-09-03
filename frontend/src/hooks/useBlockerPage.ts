import { useBeforeUnload, useBlocker } from 'react-router-dom';

export const useBlockerPage = (isModified: boolean) => {
  useBeforeUnload((event) => {
    if (isModified) {
      event.preventDefault();
    }
  });

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isModified && currentLocation !== nextLocation
  );

  return blocker;
};
