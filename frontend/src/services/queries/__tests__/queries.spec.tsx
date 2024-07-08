import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useGetPage } from '../page';
import { useGetAllWiki, useGetAllWikiWithPages, useGetWiki } from '../wiki';

import { PropsWithChildren } from 'react';
import { wikiMock, wikiPageMock, wikisMock, wikisMockWithPages } from '~/mocks';
import { server } from '~/mocks/node';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

const wrapper = ({ children }: PropsWithChildren) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Wiki GET Queries', () => {
  test('use useGetAllWiki to get all wikis', async () => {
    const { result } = renderHook(() => useGetAllWiki(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(wikisMock);
  });

  test('use useGetAllWikiWithPages to get all wikis with pages', async () => {
    const { result } = renderHook(() => useGetAllWikiWithPages(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(wikisMockWithPages);
  });

  test('use useGetWiki to get one wiki', async () => {
    const { result } = renderHook(
      () => useGetWiki('6e3d23f6-890f-4453-af19-f9853a14b354'),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(wikiMock);
  });
});

describe('Wiki Page GET Queries', () => {
  test('get one page of a wiki', async () => {
    const { result } = renderHook(
      () =>
        useGetPage({
          wikiId: wikiPageMock._id,
          pageId: wikiPageMock.pages[0]._id,
        }),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(wikiPageMock);
  });
});
