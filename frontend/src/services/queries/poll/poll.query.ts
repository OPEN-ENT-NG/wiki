import { queryOptions, useQuery } from '@tanstack/react-query';
import { pollService } from '~/services/api/poll/poll.service';

export const pollQueryOptions = {
  base: ['poll'] as const,
  findOne: (pollName: string) =>
    queryOptions({
      queryKey: [...pollQueryOptions.base, { name: pollName }] as const,
      queryFn: () => pollService.getPoll(pollName),
      staleTime: 5000,
    }),
};

export const useGetPoll = (pollName: string) => {
  return useQuery(pollQueryOptions.findOne(pollName));
};
