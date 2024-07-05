import { queryOptions, useQuery } from '@tanstack/react-query';
import { wikiService } from '../api';

/**
 * Wiki Query Options Factory
 */
export const wikiQueryOptions = {
  all: ['wiki'] as const,
  listall: () =>
    queryOptions({
      queryKey: [...wikiQueryOptions.all, 'listall'] as const,
      queryFn: wikiService.getAllWiki,
      staleTime: 5000,
    }),
  listallpages: () =>
    queryOptions({
      queryKey: [...wikiQueryOptions.all, 'listallpages'] as const,
      queryFn: wikiService.getAllWikiWithPages,
      staleTime: 5000,
    }),
  one: (wikiId: string) =>
    queryOptions({
      queryKey: [...wikiQueryOptions.all, { id: wikiId }] as const,
      queryFn: () => wikiService.getWiki(wikiId),
      staleTime: 5000,
    }),
};

/**
 * All queries and mutations
 */

export const useGetAllWiki = () => {
  return useQuery(wikiQueryOptions.listall());
};

export const useGetAllWikiWithPages = () => {
  return useQuery(wikiQueryOptions.listallpages());
};

export const useGetWiki = (wikiId: string) => {
  return useQuery(wikiQueryOptions.one(wikiId));
};
