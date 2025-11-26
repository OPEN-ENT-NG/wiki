import { mockWiki, mockWikiWithoutPages } from '~/mocks';
import { renderWithRouter } from '~/mocks/renderWithRouter';
import { renderHook, screen, waitFor } from '~/mocks/setup';
import { Index } from '~/routes/wiki';
import { useGetWiki } from '~/services';
import { useUserRights } from '~/store';

const mocks = vi.hoisted(() => {
  return {
    useMatch: vi.fn(),
  };
});

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const router =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...router,
    useLoaderData: () => mockWiki,
    useNavigate: () => mockedUseNavigate,
    useMatch: (pattern: string) => mocks.useMatch(pattern),
  };
});

vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: vi.fn(),
  usePrevious: vi.fn(),
}));

vi.mock('~/store/rights', () => ({
  useUserRights: vi.fn(),
}));

vi.mock('~/store/treeview', () => ({
  useTreeActions: () => ({
    setSelectedNodeId: vi.fn(),
    setTreeData: vi.fn(),
  }),
  useTreeData: () => [
    { id: '1', name: 'Page 1', section: true, showIconSection: false },
    { id: '2', name: 'Page 2', section: true, showIconSection: false },
  ],
  useSelectedNodeId: () => 1,
}));

vi.mock('~/store/wiki', async () => {
  const wiki =
    await vi.importActual<typeof import('~/store/wiki')>('~/store/wiki');
  return {
    ...wiki,
    useRedirectingToDefaultPage: () => false,
  };
});

vi.mock('~/services', () => ({
  useGetWiki: vi.fn(),
  wikiQueryOptions: {
    findOne: vi.fn(),
  },
}));

describe('Index Route', () => {
  beforeEach(() => {
    // Set default mock for useGetWiki with pages
    vi.mocked(useGetWiki).mockReturnValue({
      data: mockWiki,
      isLoading: false,
      isError: false,
    } as any);

    // Set default mock for useMatch
    mocks.useMatch.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should trigger a navigation to the Assistant page if user is contrib', async () => {
    vi.mocked(useUserRights).mockReturnValue({
      manager: true,
      creator: false,
      contrib: true,
      read: false,
    });

    // match the wiki route
    mocks.useMatch.mockImplementation((pattern: string) => {
      if (pattern === '/id/:wikiId') {
        return true;
      }
    });
    // Mock useGetWiki to return a wiki without pages
    vi.mocked(useGetWiki).mockReturnValue({
      data: mockWikiWithoutPages,
    } as any);

    renderWithRouter(`/id/${mockWikiWithoutPages._id}`, <Index />);

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith(
        `/id/${mockWikiWithoutPages._id}/pages/assistant`,
        { replace: true },
      );
    });
  });

  it('should render the AppHeader', async () => {
    renderWithRouter(`/id/${mockWiki._id}`, <Index />);

    await waitFor(() => {
      expect(screen.findByLabelText('breadcrumb'));
    });
  });

  it('should render Index page if no data found', async () => {
    renderWithRouter(`/id/${mockWiki._id}`, <Index />);

    const { result } = renderHook(() => {
      return false;
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('should render Menu component', async () => {
    // match the wiki route
    mocks.useMatch.mockImplementation((pattern: string) => {
      if (pattern === '/id/:wikiId') {
        return true;
      }
      if (pattern === '/id/:wikiId/pages/assistant/*') {
        return false;
      }
    });

    renderWithRouter(
      `/id/${mockWiki._id}/page/${mockWiki.pages[0]._id}`,
      <Index />,
    );

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /wiki.pagelist/i }));
    });
  });

  it('should render TreeView component', async () => {
    const { container } = renderWithRouter(`/id/${mockWiki._id}`, <Index />);

    await waitFor(() =>
      expect(container.querySelector('.treeview')).toBeDefined(),
    );
  });

  it('should trigger a navigation if the data has an indexed/default page', async () => {
    mocks.useMatch.mockImplementation((pattern: string) => {
      if (pattern === '/id/:wikiId') {
        return true;
      }
    });

    renderWithRouter(`/id/${mockWiki._id}`, <Index />);

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith(
        `/id/${mockWiki._id}/page/${mockWiki.pages[0]._id}`,
        { replace: true },
      );
    });
  });
});
