import { renderHook } from '@testing-library/react';
import { test } from 'vitest';
import { mockPage, mockWiki } from '~/mocks';
import { Providers } from '~/providers';
import { findPage } from '~/utils/findPage';
import { useFormPage } from './useFormPage/useFormPage';

// Mocks
const mocks = vi.hoisted(() => ({
  useNavigation: vi.fn(),
  useLocation: vi.fn(),
  useParams: vi.fn(),
  useGetWiki: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigation: mocks.useNavigation,
  useLocation: mocks.useLocation,
  useParams: mocks.useParams,
}));

vi.mock('~/services', () => ({
  useGetWiki: mocks.useGetWiki,
}));

describe('useFormPage hook tests', () => {
  const page = findPage(mockWiki, '001');
  const mockNavigation = { state: 'idle' };
  const mockLocation = {
    pathname: `/wiki/id/${mockWiki._id}/page/${page?._id}`,
  };
  const mockParams = { wikiId: mockWiki._id, pageId: page?._id };
  const mockWikiData = mockWiki;

  beforeEach(() => {
    vi.mocked(mocks.useNavigation).mockReturnValue(mockNavigation);
    vi.mocked(mocks.useLocation).mockReturnValue(mockLocation);
    vi.mocked(mocks.useParams).mockReturnValue(mockParams);
    vi.mocked(mocks.useGetWiki).mockReturnValue({ data: mockWikiData });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Do not disable visibility toggle for a parent page', () => {
    const { result } = renderHook(() => useFormPage(mockPage.pages[0]), {
      wrapper: Providers,
    });

    expect(result.current.disableToggle()).toBe(false);
  });

  test('Disable visibility toggle for a subpage whose parent page is not visible', () => {
    const subpage = mockWiki.pages.find((page) => page._id === '006');

    mocks.useLocation.mockReturnValue({
      pathname: `/wiki/id/${mockWiki._id}/page/${subpage?._id}`,
    });
    mocks.useParams.mockReturnValue({
      wikiId: mockWiki._id,
      pageId: subpage?._id,
    });

    const { result } = renderHook(() => useFormPage(subpage), {
      wrapper: Providers,
    });

    expect(result.current.disableToggle()).toBe(true);
  });

  test('Do not disable visibility toggle for a subpage whose parent page is visible', () => {
    const subpage = findPage(mockWiki, '008');

    mocks.useLocation.mockReturnValue({
      pathname: `/wiki/id/${mockWiki._id}/page/${subpage?._id}`,
    });
    mocks.useParams.mockReturnValue({
      wikiId: mockWiki._id,
      pageId: subpage?._id,
    });

    const { result } = renderHook(() => useFormPage(subpage), {
      wrapper: Providers,
    });

    expect(result.current.disableToggle()).toBe(false);
  });

  test('New page creation form toggle is ON', () => {
    const { result } = renderHook(() => useFormPage(), {
      wrapper: Providers,
    });

    expect(result.current.getDefaultVisibleValue()).toBe(true);
  });

  test('Existing visible page edition form toggle is ON', () => {
    const page = findPage(mockWiki, '001');

    const { result } = renderHook(() => useFormPage(page), {
      wrapper: Providers,
    });

    expect(result.current.getDefaultVisibleValue()).toBe(true);
  });

  test('New subpage creation from a visible parent page has toggle ON', () => {
    const visibleParentPage = findPage(mockWiki, '007');

    mocks.useLocation.mockReturnValue({
      pathname: `/wiki/id/${mockWiki._id}/page/${visibleParentPage?._id}/subpage/create`,
    });
    mocks.useParams.mockReturnValue({
      wikiId: mockWiki._id,
      pageId: visibleParentPage?._id,
    });

    const { result } = renderHook(() => useFormPage(), {
      wrapper: Providers,
    });

    expect(result.current.getDefaultVisibleValue()).toBe(true);
  });

  test('New subpage creation from a non visible parent page has toggle OFF', () => {
    const nonvisibleParentPage = findPage(mockWiki, '005');

    mocks.useLocation.mockReturnValue({
      pathname: `/wiki/id/${mockWiki._id}/page/${nonvisibleParentPage?._id}/subpage/create`,
    });
    mocks.useParams.mockReturnValue({
      wikiId: mockWiki._id,
      pageId: nonvisibleParentPage?._id,
    });

    const { result } = renderHook(() => useFormPage(), {
      wrapper: Providers,
    });

    expect(result.current.getDefaultVisibleValue()).toBe(false);
  });
});
