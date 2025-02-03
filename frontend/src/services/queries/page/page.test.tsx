import { act, renderHook, waitFor } from '@testing-library/react';
import {
  pageQueryOptions,
  useCreatePage,
  useDeletePage,
  useDuplicatePage,
  useGetPage,
  useGetPagesFromWiki,
  useGetRevisionPage,
  useGetRevisionsPage,
  useUpdatePage,
} from './page';

import {
  mockWikiWithOnePage,
  mockRevision,
  mockWikiPagesWithoutContent,
  mockPage,
} from '~/mocks';
import { wrapper } from '~/mocks/setup';
import { queryClient } from '~/providers';
import { wikiQueryOptions } from '~/services';

const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');

describe('Wiki Page GET Queries', () => {
  test('use useGetPage hook to get one page of a wiki', async () => {
    const { result } = renderHook(
      () =>
        useGetPage({
          wikiId: mockWikiWithOnePage._id,
          pageId: mockWikiWithOnePage.pages[0]._id,
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(mockPage);
    });
  });

  test('use useGetPagesFromWiki hook to get pages of a wiki', async () => {
    const { result } = renderHook(
      () =>
        useGetPagesFromWiki({
          wikiId: mockWikiPagesWithoutContent._id,
          content: false,
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(mockWikiPagesWithoutContent.pages);
    });
  });

  test('use useGetRevisionsPage to get revisions of a page', async () => {
    const { result } = renderHook(
      () =>
        useGetRevisionsPage({
          wikiId: mockWikiWithOnePage._id,
          pageId: mockWikiWithOnePage.pages[0]._id,
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(mockRevision);
    });
  });

  test('use useGetRevisionPage to get revisions of a page', async () => {
    const { result } = renderHook(
      () =>
        useGetRevisionPage({
          wikiId: mockWikiWithOnePage._id,
          pageId: mockWikiWithOnePage.pages[0]._id,
          revisionId: mockRevision[0]._id,
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toEqual(mockRevision[0]);
    });
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

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
      expect(result.current.variables).toStrictEqual(variables);
      expect(result.current.data).toStrictEqual(data);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: wikiQueryOptions.findAll().queryKey,
      });
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

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.variables).toStrictEqual(variables);
      expect(result.current.data).toStrictEqual(response);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: wikiQueryOptions.findAll().queryKey,
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: pageQueryOptions.findOne({
          wikiId: 'wikiId',
          pageId: 'pageId',
        }).queryKey,
      });
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

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.variables).toStrictEqual(variables);
      expect(result.current.data).toStrictEqual(response);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: wikiQueryOptions.findAll().queryKey,
      });
      expect(removeQueriesSpy).toHaveBeenCalledWith({
        queryKey: pageQueryOptions.findOne({
          wikiId: 'wikiId',
          pageId: 'pageId',
        }).queryKey,
      });
    });
  });

  test('duplicate a page with useDuplicatePage hook', async () => {
    const { result } = renderHook(() => useDuplicatePage(), { wrapper });
    // prepare the mock
    const variables = {
      destinationWikiId: 'destinationWikiId',
      data: {
        title: 'Duplicated Page',
        content: 'duplicated content',
        isVisible: true,
        position: 0,
      },
    };
    // execute the mutation
    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      // check the result
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toStrictEqual(variables.data);
      // check the invalidations
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: pageQueryOptions.findAllFromWiki({
          wikiId: 'destinationWikiId',
          content: true,
        }).queryKey,
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: wikiQueryOptions.findAllWithPages().queryKey,
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: wikiQueryOptions.findOne('destinationWikiId').queryKey,
      });
    });
  });
});
