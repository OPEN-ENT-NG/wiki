import { mockWiki } from '~/mocks';
import { renderWithRouter } from '~/mocks/renderWithRouter';
import { renderHook, screen, waitFor } from '~/mocks/setup';
import { Page } from '~/routes/page';
import { Index } from '~/routes/wiki';

const mockedUseNavigate = vi.fn();
const mockedUseMatch = vi.fn();

vi.mock('react-router-dom', async () => {
  const router =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...router,
    useLoaderData: () => mockWiki,
    useNavigate: () => mockedUseNavigate,
    useMatch: () => mockedUseMatch,
  };
});

vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: vi.fn(),
  usePrevious: vi.fn(),
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

describe('Index Route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    renderWithRouter(`/id/${mockWiki._id}`, <Index />);
  });

  it('should navigate to the Index page', async () => {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /wiki.create.new.page/i }));
    });
  });

  it('should render the AppHeader', () => {
    expect(screen.findByLabelText('breadcrumb'));
  });

  it('should render Index page if no data found', async () => {
    const { result } = renderHook(() => {
      return false;
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('should render Menu component', async () => {
    expect(screen.getByRole('navigation', { name: /wiki.pagelist/i }));
  });

  it('should render TreeView component', async () => {
    const { container } = renderWithRouter(`/id/${mockWiki._id}`, <Index />);

    await waitFor(() =>
      expect(container.querySelector('.treeview')).toBeDefined(),
    );
  });

  it('should trigger a navigation if the data has an indexed/default page', async () => {
    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith(
        `/id/${mockWiki._id}/page/${mockWiki.pages[3]._id}`,
        { replace: true },
      );
    });
  });

  it('should navigate to the page route if data is found', async () => {
    renderWithRouter(
      `/id/${mockWiki._id}/page/${mockWiki.pages[3]._id}`,
      <Page />,
    );
  });
});
