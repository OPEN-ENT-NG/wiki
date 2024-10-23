import { queryOptions, useQuery } from '@tanstack/react-query';
import { wikiService } from '../..';

/**
 * Wiki Query Options Factory
 */
export const wikiQueryOptions = {
  base: ['wiki'] as const,
  findAllAsResources: () =>
    queryOptions({
      queryKey: [...wikiQueryOptions.base, 'resources'] as const,
      queryFn: () => wikiService.getWikisFromExplorer({}),
      staleTime: 5000,
    }),
  findAll: () =>
    queryOptions({
      queryKey: [...wikiQueryOptions.base, 'list'] as const,
      queryFn: wikiService.getWikis,
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

export const useGetWikis = () => {
  return useQuery(wikiQueryOptions.findAll());
};

export const useGetAllWikisAsResources = () => {
  return useQuery(wikiQueryOptions.findAllAsResources());
};

export const useGetAllWikisWithPages = () => {
  return useQuery(wikiQueryOptions.findAllWithPages());
};

export const useGetWiki = (wikiId: string) => {
  return useQuery(wikiQueryOptions.findOne(wikiId));
};
