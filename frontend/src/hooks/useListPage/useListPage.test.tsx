import { ToolbarButtonItem } from '@edifice-ui/react';
import { mockWikiPages } from '~/mocks';
import { renderHook } from '~/mocks/setup';
import { useListPage } from './useListPage';

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
  useUserRights: vi.fn(),
  useBreakpoint: vi.fn(),
  setOpenDeleteModal: vi.fn(),
  setOpenRevisionModal: vi.fn(),
  useIsAuthorOrManager: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: mocks.useNavigate,
  useParams: mocks.useParams,
}));

vi.mock('~/store/rights', () => ({
  useUserRights: mocks.useUserRights,
}));

vi.mock('~/store/wiki', () => ({
  useOpenDeleteModal: () => true,
  useOpenRevisionModal: () => true,
  useWikiActions: () => ({
    setOpenDeleteModal: mocks.setOpenDeleteModal,
    setOpenRevisionModal: mocks.setOpenRevisionModal,
  }),
}));

vi.mock('@edifice-ui/react', () => ({
  useBreakpoint: mocks.useBreakpoint,
}));

vi.mock('~/hooks/useIsAuthorOrManager', () => ({
  useIsAuthorOrManager: mocks.useIsAuthorOrManager,
}));

const initialRights = {
  contrib: false,
  creator: false,
  manager: false,
  read: true,
};

const selectedPages = [mockWikiPages.pages[0]._id, mockWikiPages.pages[1]._id];

describe('useListPage', () => {
  beforeEach(() => {
    mocks.useIsAuthorOrManager.mockReturnValue({
      isManagerOfWiki: true,
      isManagerOfSelectedPage: false,
    });
    mocks.useParams.mockReturnValue({ wikiId: 'testWikiId' });
    mocks.useUserRights.mockReturnValue(initialRights);
    mocks.useBreakpoint.mockReturnValue({ lg: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct items for desktop view', () => {
    const { result } = renderHook(() =>
      useListPage({ selectedPages: [selectedPages[0]], pagesCount: 1 }),
    );

    expect(result.current).toHaveLength(6);
    expect(result.current[0].name).toBe('read');
    expect(result.current[1].name).toBe('move');
    expect(result.current[2].name).toBe('duplicate');
    expect(result.current[3].name).toBe('history');
    expect(result.current[4].name).toBe('print');
    expect(result.current[5].name).toBe('delete');
  });

  it('should disable buttons when no pages are selected', () => {
    const { result } = renderHook(() =>
      useListPage({ selectedPages: [], pagesCount: 0 }),
    );

    result.current.forEach((item: any) => {
      expect(item.props.disabled).toBe(true);
    });
  });

  it('should enable only delete button when multiple pages are selected', () => {
    const { result } = renderHook(() =>
      useListPage({
        selectedPages: [selectedPages[0], selectedPages[1]],
        pagesCount: 2,
      }),
    );

    expect((result.current[0] as ToolbarButtonItem).props.disabled).toBe(true); // read
    expect((result.current[1] as ToolbarButtonItem).props.disabled).toBe(false); // move
    expect((result.current[2] as ToolbarButtonItem).props.disabled).toBe(true); // duplicate
    expect((result.current[3] as ToolbarButtonItem).props.disabled).toBe(true); // history
    expect((result.current[4] as ToolbarButtonItem).props.disabled).toBe(true); // print
    expect((result.current[5] as ToolbarButtonItem).props.disabled).toBe(false); // delete
  });

  it('should hide certain buttons for read-only users', async () => {
    mocks.useUserRights.mockReturnValue({
      read: true,
      contrib: false,
      creator: false,
      manager: false,
    });

    const { result } = renderHook(() =>
      useListPage({ selectedPages: [selectedPages[0]], pagesCount: 1 }),
    );

    expect(result.current).toHaveLength(6);
    expect(result.current[1].visibility).toBe('hide'); // move
    expect(result.current[2].visibility).toBe('hide'); // duplicate
    expect(result.current[3].visibility).toBe('hide'); // history
    expect(result.current[5].visibility).toBe('hide'); // delete
  });

  it('should open revision modal when history button is clicked', () => {
    const { result } = renderHook(() =>
      useListPage({ selectedPages: [selectedPages[0]], pagesCount: 1 }),
    );

    ((result.current[3] as ToolbarButtonItem).props.onClick as () => void)();
    expect(mocks.setOpenRevisionModal).toHaveBeenCalledWith(true);
  });

  it('should open delete modal when delete button is clicked', () => {
    const { result } = renderHook(() =>
      useListPage({ selectedPages: [selectedPages[0]], pagesCount: 1 }),
    );

    ((result.current[5] as ToolbarButtonItem).props.onClick as () => void)();
    expect(mocks.setOpenDeleteModal).toHaveBeenCalledWith(true);
  });
});
