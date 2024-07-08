import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  pageQueryOptions,
  useCreatePage,
  useDeletePage,
  useGetPage,
  useGetRevisionsPage,
  useUpdatePage,
} from '../page';
import {
  useGetAllWikis,
  useGetAllWikisWithPages,
  useGetWiki,
  wikiQueryOptions,
} from '../wiki';

import { PropsWithChildren } from 'react';
import {
  mockPage,
  mockRevision,
  mockWiki,
  mockWikis,
  mockWikisWithPages,
} from '~/mocks';
import { server } from '~/mocks/node';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Wiki GET Queries', () => {
  test('use useGetAllWikis to get all wikis', async () => {
    const { result } = renderHook(() => useGetAllWikis(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(mockWikis);
  });

  test('use useGetAllWikisWithPages to get all wikis with pages', async () => {
    const { result } = renderHook(() => useGetAllWikisWithPages(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(mockWikisWithPages);
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
    expect(result.current.data).toEqual(mockWiki);
  });
});

describe('Wiki Page GET Queries', () => {
  test('get one page of a wiki', async () => {
    const { result } = renderHook(
      () =>
        useGetPage({
          wikiId: mockPage._id,
          pageId: mockPage.pages[0]._id,
        }),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(mockPage);
  });

  test('get revisions of a page', async () => {
    const { result } = renderHook(
      () =>
        useGetRevisionsPage({
          wikiId: mockPage._id,
          pageId: mockPage.pages[0]._id,
        }),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(mockRevision);
  });
});

describe('Wiki Page mutations Queries', () => {
  test('create a new page with useCreatePage hook', async () => {
    const { result } = renderHook(() => useCreatePage(), { wrapper });
    const variables = {
      wikiId: 'wikiId',
      data: { title: 'Test Page', content: 'test' },
    };
    const data = {
      title: 'Test Page',
      content: 'test',
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.variables).toStrictEqual(variables);

    expect(result.current.data).toStrictEqual(data);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: wikiQueryOptions.findAll().queryKey,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: wikiQueryOptions.findAllWithPages().queryKey,
    });
  });

  test('update a page with useUpdatePage hook', async () => {
    const { result } = renderHook(() => useUpdatePage(), { wrapper });

    const variables = {
      wikiId: 'wikiId',
      pageId: 'pageId',
      data: { title: 'Update Page', content: 'update content' },
    };
    const response = { number: 1 };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.variables).toStrictEqual(variables);

    expect(result.current.data).toStrictEqual(response);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: wikiQueryOptions.findAll().queryKey,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: pageQueryOptions.findOne({ wikiId: 'wikiId', pageId: 'pageId' })
        .queryKey,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: wikiQueryOptions.findAllWithPages().queryKey,
    });
  });

  test('delete a page with useDeletePage hook', async () => {
    const { result } = renderHook(() => useDeletePage(), { wrapper });

    const variables = {
      wikiId: 'wikiId',
      pageId: 'pageId',
    };
    const response = { number: 0 };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.variables).toStrictEqual(variables);

    expect(result.current.data).toStrictEqual(response);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: wikiQueryOptions.findAll().queryKey,
    });

    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: pageQueryOptions.findOne({ wikiId: 'wikiId', pageId: 'pageId' })
        .queryKey,
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: wikiQueryOptions.findAllWithPages().queryKey,
    });
  });
});
