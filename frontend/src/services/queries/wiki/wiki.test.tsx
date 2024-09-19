import { renderHook, waitFor } from '@testing-library/react';
import { useGetWiki, useGetWikis } from './wiki';

import { mockWiki, mockWikis } from '~/mocks';
import '~/mocks/setup.msw';
import { wrapper } from '~/mocks/setup.vitest';

describe('Wiki GET Queries', () => {
  test('use useGetWikis hook to get wikis', async () => {
    const { result } = renderHook(() => useGetWikis(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(mockWikis);
    });
  });

  test('use useGetWiki hook to get one wiki', async () => {
    const { result } = renderHook(
      () => useGetWiki('6e3d23f6-890f-4453-af19-f9853a14b354'),
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(mockWiki);
    });
  });
});
