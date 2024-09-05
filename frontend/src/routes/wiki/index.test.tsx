import { mockWiki } from '~/mocks';
import {
  renderHook,
  renderWithRouter,
  screen,
  waitFor,
} from '~/mocks/setup.vitest';
import { Page } from '~/routes/page';
import { Index } from '~/routes/wiki';

const mockedUseNavigate = vi.fn();
const mockedUseMatch = vi.fn();

vi.mock('react-router-dom', async () => {
  const router = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
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

describe('Index Route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    renderWithRouter('/id/:wikiId', `/id/${mockWiki._id}`, <Index />);
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
    await waitFor(() => expect(screen.findByLabelText('Wiki')));
  });

  it('should render TreeView component', async () => {
    const { container } = renderWithRouter(
      '/id/:wikiId',
      `/id/${mockWiki._id}`,
      <Index />
    );

    await waitFor(() =>
      expect(container.querySelector('.treeview')).toBeDefined()
    );
  });

  it('should trigger a navigation if the data has an indexed/default page', async () => {
    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith(
        `/id/${mockWiki._id}/page/${mockWiki.pages[3]._id}`
      );
    });
  });

  it('should navigate to the page route if data is found', async () => {
    renderWithRouter(
      '/id/:wikiId/page/:pageId',
      `/id/${mockWiki._id}/page/${mockWiki.pages[3]._id}`,
      <Page />
    );
  });
});
