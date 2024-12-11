import { IResource } from '@edifice.io/client';
import { useUser } from '@edifice.io/react';
import { useEffect, useState } from 'react';
/**
 * Hook to filter wikis based on user rights
 * @param wikis - The wikis to filter
 * @returns The filtered wikis and a loading state
 */
export const useFilteredWikis = (wikis: IResource[] | undefined) => {
  const [filteredWikis, setFilteredWikis] = useState<IResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user: currentUser } = useUser();
  useEffect(() => {
    const filterWikis = async (): Promise<void> => {
      // If no wikis, set filtered wikis to empty array and set loading to true
      if (!wikis) {
        setFilteredWikis([]);
        setIsLoading(true);
        return;
      }

      try {
        // Get user from store or fetch it
        if (!currentUser) {
          setFilteredWikis([]);
          return;
        }
        // Filter wikis by user rights
        const filtered = wikis.filter((wiki) =>
          wiki.rights.some(
            (right) =>
              right === `creator:${currentUser.userId}` ||
              right === `user:${currentUser.userId}:contrib` ||
              right === `user:${currentUser.userId}:manager` ||
              currentUser.groupsIds.some(
                (groupId) =>
                  right === `group:${groupId}:contrib` ||
                  right === `group:${groupId}:manager`,
              ),
          ),
        );
        // Set filtered wikis
        setFilteredWikis(filtered);
      } catch (error) {
        // Set filtered wikis to empty array
        console.error('Error while filtering wikis:', error);
        setFilteredWikis([]);
      } finally {
        // Set loading to false
        setIsLoading(false);
      }
    };

    filterWikis();
  }, [wikis, currentUser, setFilteredWikis, setIsLoading]);

  return { filteredWikis, isLoading };
};
