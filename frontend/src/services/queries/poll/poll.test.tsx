import { renderHook, waitFor } from '@testing-library/react';

import { mockPoll } from '~/mocks';
import { wrapper } from '~/mocks/setup';
import { useGetPoll } from './poll.query';

describe('Poll GET Queries', () => {
  test('use useGetPoll hook to get one poll', async () => {
    const { result } = renderHook(() => useGetPoll('import-pdf'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(mockPoll);
    });
  });
});
