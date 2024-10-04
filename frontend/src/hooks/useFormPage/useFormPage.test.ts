import { test } from 'vitest';
import { useFormPage } from './useFormPage';
import { mockPage, mockWiki } from '~/mocks';
import { renderHook } from '@testing-library/react';
import { Providers } from '~/providers';
import { findPage } from '~/utils/findPage';

// Mocks
const mocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  useParams: vi.fn(),
  useGetWiki: vi.fn(),
  useSubmit: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useLocation: mocks.useLocation,
  useParams: mocks.useParams,
  useSubmit: mocks.useSubmit,
}));

vi.mock('~/services', () => ({
  useGetWiki: mocks.useGetWiki,
}));

describe('useFormPage hook tests', () => {
  const page = findPage(mockWiki, '001');

  beforeEach(() => {
    vi.mocked(mocks.useLocation).mockReturnValue({
      pathname: `/wiki/id/${mockWiki._id}/page/${page?._id}`,
    });
    vi.mocked(mocks.useParams).mockReturnValue({
      wikiId: mockWiki._id,
      pageId: page?._id,
    });
    vi.mocked(mocks.useGetWiki).mockReturnValue({ data: mockWiki });
    vi.mocked(mocks.useSubmit).mockReturnValue((data: any) => {
      return;
    });
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

  test('New page creation form toggle is OFF (page is visible)', () => {
    const { result } = renderHook(() => useFormPage(), {
      wrapper: Providers,
    });

    expect(result.current.getDefaultHiddenToggleValue()).toBe(false);
  });

  test('Existing visible page edition form toggle is OFF (page is visible)', () => {
    const page = findPage(mockWiki, '001');

    const { result } = renderHook(() => useFormPage(page), {
      wrapper: Providers,
    });

    expect(result.current.getDefaultHiddenToggleValue()).toBe(false);
  });

  test('New subpage creation from a visible parent page has toggle OFF (page is visible)', () => {
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

    expect(result.current.getDefaultHiddenToggleValue()).toBe(false);
  });

  test('New subpage creation from a non visible parent page has toggle ON (page is not visible)', () => {
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

    expect(result.current.getDefaultHiddenToggleValue()).toBe(true);
  });
});
