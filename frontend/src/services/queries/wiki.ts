import { queryOptions, useQuery } from '@tanstack/react-query';
import { wikiService } from '../api';

/**
 * Wiki Query Options Factory
 */
export const wikiQueryOptions = {
  base: ['wiki'] as const,
  findAll: () =>
    queryOptions({
      queryKey: [...wikiQueryOptions.base, 'listall'] as const,
      queryFn: wikiService.getAllWikis,
      staleTime: 5000,
    }),
  findAllWithPages: () =>
    queryOptions({
      queryKey: [...wikiQueryOptions.base, 'listallpages'] as const,
      queryFn: wikiService.getAllWikisWithPages,
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

export const useGetAllWikis = () => {
  return useQuery(wikiQueryOptions.findAll());
};

export const useGetAllWikisWithPages = () => {
  return useQuery(wikiQueryOptions.findAllWithPages());
};

export const useGetWiki = (wikiId: string) => {
  return useQuery(wikiQueryOptions.findOne(wikiId));
};
