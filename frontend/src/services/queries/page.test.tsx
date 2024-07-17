import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  pageQueryOptions,
  useCreatePage,
  useDeletePage,
  useGetPage,
  useGetRevisionsPage,
  useUpdatePage,
} from './page';
import { wikiQueryOptions } from './wiki';

import { PropsWithChildren } from 'react';
import { mockPage, mockRevision } from '~/mocks';
import '~/mocks/setup.msw';

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
describe('Wiki Page GET Queries', () => {
  test('use useGetPage hook to get one page of a wiki', async () => {
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

  test('use useGetRevisionsPage to get revisions of a page', async () => {
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
  });
});