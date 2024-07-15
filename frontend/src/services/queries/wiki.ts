import { queryOptions, useQuery } from '@tanstack/react-query';
import { wikiService } from '..';

/**
 * Wiki Query Options Factory
 */
export const wikiQueryOptions = {
  base: ['wiki'] as const,
  findAll: () =>
    queryOptions({
      queryKey: [...wikiQueryOptions.base, 'list'] as const,
      queryFn: wikiService.getWikis,
      staleTime: 5000,
    }),
  findOne: (wikiId: string) =>
    queryOptions({
      queryKey: [...wikiQueryOptions.base, { id: wikiId }] as const,
      queryFn: () => wikiService.getWiki(wikiId),
      staleTime: 5000,
    }),
};

/**
 * All queries and mutations
 */

export const useGetWikis = () => {
  return useQuery(wikiQueryOptions.findAll());
};

export const useGetWiki = (wikiId: string) => {
  return useQuery(wikiQueryOptions.findOne(wikiId));
};
