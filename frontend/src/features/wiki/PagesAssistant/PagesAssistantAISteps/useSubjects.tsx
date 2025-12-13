import { useMemo } from 'react';
import { useLevels } from './useLevels';

/**
 * Hooks that returns the subjects associated to the level.
 * @param level the level to get the Subjects from
 * @returns an Object with a subjects property containing the subjects associated to the level
 */
export const useSubjects = (level: string) => {
  const { collegeLevels, lyceeLevels } = useLevels();

  const subjects = useMemo(
    () =>
      [...collegeLevels, ...lyceeLevels]
        .find((lvl) => lvl.value === level)
        ?.subjects.sort((a, b) => (a.value > b.value ? 1 : -1)) ?? [],
    [collegeLevels, lyceeLevels, level],
  );

  return {
    subjects,
  };
};
