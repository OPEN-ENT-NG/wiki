import { renderHook, waitFor } from '@testing-library/react';
import { mockPage, mockWiki } from '~/mocks';
import { Providers } from '~/providers';
import { findPage } from '~/utils/findPage';
import { useFormPage } from './useFormPage';

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
    mocks.useLocation.mockReturnValue({
      pathname: `/wiki/id/${mockWiki._id}/page/${page?._id}`,
    });
    mocks.useParams.mockReturnValue({
      wikiId: mockWiki._id,
      pageId: page?._id,
    });
    mocks.useGetWiki.mockReturnValue({ data: mockWiki });
    mocks.useSubmit.mockReturnValue(() => {
      return;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Do not disable visibility toggle for a parent page', async () => {
    const { result } = renderHook(() => useFormPage(mockPage.pages[0]), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current.disableToggle()).toBe(false);
    });
  });

  test('Disable visibility toggle for a subpage whose parent page is not visible', async () => {
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

    await waitFor(() => {
      expect(result.current.disableToggle()).toBe(true);
    });
  });

  test('Do not disable visibility toggle for a subpage whose parent page is visible', async () => {
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

    await waitFor(() => {
      expect(result.current.disableToggle()).toBe(false);
    });
  });

  test('New page creation form toggle is OFF (page is visible)', async () => {
    const { result } = renderHook(() => useFormPage(), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current.getDefaultHiddenToggleValue()).toBe(false);
    });
  });

  test('Existing visible page edition form toggle is OFF (page is visible)', async () => {
    const page = findPage(mockWiki, '001');

    const { result } = renderHook(() => useFormPage(page), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current.getDefaultHiddenToggleValue()).toBe(false);
    });
  });

  test('New subpage creation from a visible parent page has toggle OFF (page is visible)', async () => {
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

    await waitFor(() => {
      expect(result.current.getDefaultHiddenToggleValue()).toBe(false);
    });
  });

  test('New subpage creation from a non visible parent page has toggle ON (page is not visible)', async () => {
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

    await waitFor(() => {
      expect(result.current.getDefaultHiddenToggleValue()).toBe(true);
    });
  });
});
