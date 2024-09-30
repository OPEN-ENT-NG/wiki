import { test } from 'vitest';

import '~/mocks/setup.msw';
import { renderHook, waitFor } from '@testing-library/react';
import { useRevision } from './useRevision';
import { mockPage, mockRevision } from '~/mocks';
import { wrapper } from '~/mocks/setup.vitest';

/**
 * We mock useUserRights (store)
 */
const mocks = vi.hoisted(() => {
  return {
    useUserRights: vi.fn(),
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    useGetPage: vi.fn(),
    useGetRevisionPage: vi.fn(),
  };
});
/**
 * We use mocks in a mock of the store
 */
vi.mock('~/store/rights', () => ({
  useUserRights: mocks.useUserRights,
}));
/**
 * Mock React Router params
 */
vi.mock('react-router-dom', () => ({
  useParams: mocks.useParams,
  useNavigate: mocks.useNavigate,
}));
/**
 * Mock current page and revision
 */
vi.mock('~/services', () => ({
  useGetRevisionPage: mocks.useGetRevisionPage,
  useGetPage: mocks.useGetPage,
}));
describe('useRevision hook', () => {
  beforeEach(() => {
    // mock params
    mocks.useParams.mockReturnValue({
      wikiId: '1',
      pageId: '1',
      versionId: '1',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  test('should not be able to restore when user is not contributor', async () => {
    // mock readonly rights
    mocks.useUserRights.mockReturnValue({
      contrib: false,
      creator: false,
      manager: false,
      read: true,
    });
    // render hook
    const {
      result: {
        current: { canRestore },
      },
    } = renderHook(() => useRevision(), {
      wrapper,
    });
    expect(canRestore()).toBeFalsy();
  });

  test('should not be able to restore when user is contributor', async () => {
    // mock contrib rights rights
    mocks.useUserRights.mockReturnValue({
      contrib: true,
      creator: false,
      manager: false,
      read: true,
    });
    // render hook
    const {
      result: {
        current: { canRestore },
      },
    } = renderHook(() => useRevision(), {
      wrapper,
    });
    expect(canRestore()).toBeTruthy();
  });

  test('should return page merged with current revision', async () => {
    // mock current page
    mocks.useGetPage.mockReturnValue({
      data: mockPage.pages[0],
    });
    // mock current revision
    mocks.useGetRevisionPage.mockReturnValue({
      data: mockRevision[0],
    });
    // render hook
    const { result } = renderHook(() => useRevision(), {
      wrapper,
    });
    await waitFor(() => {
      const { getPageVersionFromRoute } = result.current;
      const page = getPageVersionFromRoute();
      expect(page.data.title).eq(mockRevision[0].title);
      expect(page.data.content).eq(mockRevision[0].content);
      expect(page.data.lastContributer).eq(mockRevision[0].userId);
      expect(page.data.lastContributerName).eq(mockRevision[0].username);
      expect(page.data.modified.$date).eq(mockRevision[0].date.$date);
    });
  });

  test('should return latest page', async () => {
    // mock current page
    const firstPage = mockPage.pages[0];
    mocks.useGetPage.mockReturnValue({
      data: firstPage,
    });
    // mock current revision
    mocks.useGetRevisionPage.mockReturnValue({
      data: undefined,
    });
    // render hook
    const { result } = renderHook(() => useRevision(), {
      wrapper,
    });
    await waitFor(() => {
      const { getPageVersionFromRoute } = result.current;
      const page = getPageVersionFromRoute();
      expect(page.data.title).eq(firstPage.title);
      expect(page.data.content).eq(firstPage.content);
      expect(page.data.lastContributer).eq(firstPage.lastContributer);
      expect(page.data.lastContributerName).eq(firstPage.lastContributerName);
      expect(page.data.modified.$date).eq(firstPage.modified.$date);
    });
  });
});
