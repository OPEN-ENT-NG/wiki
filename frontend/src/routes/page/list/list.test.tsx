import { mockActionItemsAriaLabel, mockWikiPagesWithoutContent } from '~/mocks';
import { render, screen, within } from '~/mocks/setup';
import { PageList } from './list';

const mocks = vi.hoisted(() => ({
  useBreakpoint: vi.fn(),
  useDate: vi.fn(),
  useNavigate: vi.fn(),
  useGetPagesFromWiki: vi.fn(),
  useLocation: vi.fn(),
  useIsAuthorOrManager: vi.fn(),
  useGetPagesViewsCounter: vi.fn(),
  useGetPageViewsDetails: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const router =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...router,
    useLocation: () => mocks.useLocation,
    useNavigate: () => mocks.useNavigate,
  };
});

vi.mock('@edifice.io/react', async () => {
  const actual = await vi.importActual('@edifice.io/react');
  return {
    ...actual,
    useBreakpoint: mocks.useBreakpoint,
    useDate: () => ({
      formatDate: () => {
        return '00/00/00';
      },
    }),
  };
});

vi.mock('~/services', () => ({
  useGetPagesFromWiki: mocks.useGetPagesFromWiki,
  useGetPagesViewsCounter: mocks.useGetPagesViewsCounter,
  useGetPageViewsDetails: mocks.useGetPageViewsDetails,
}));
//mock isAuthorOrManager
vi.mock('~/hooks/useIsAuthorOrManager', () => ({
  useIsAuthorOrManager: mocks.useIsAuthorOrManager,
}));

describe('Pages List', () => {
  const mockedData = mockWikiPagesWithoutContent.pages
    ?.filter((page) => page.isVisible)
    .sort((a, b) => b.modified.$date - a.modified.$date);
  const mockedPagesViews = {
    [mockedData[0]._id]: 10,
    [mockedData[1]._id]: 20,
  };
  const mockedPageViewsDetails = {
    viewsCounter: 10,
    uniqueViewsCounter: 1,
    uniqueViewsPerProfile: [{ profile: 'Personnel', counter: 1 }],
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    mocks.useIsAuthorOrManager.mockReturnValue({
      isManagerOfWiki: true,
      isManagerOfSelectedPage: false,
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    mocks.useBreakpoint.mockReturnValue({
      lg: true,
    });

    mocks.useGetPagesFromWiki.mockReturnValue({
      data: mockedData,
      isPending: false,
    });

    mocks.useGetPagesViewsCounter.mockReturnValue({
      data: mockedPagesViews,
      isPending: false,
    });

    mocks.useGetPageViewsDetails.mockReturnValue({
      data: mockedPageViewsDetails,
      isPending: false,
    });
  });

  it('should render component', async () => {
    render(<PageList />);
    expect(screen.getByText('wiki.pagelist')).toBeInTheDocument();
  });

  it('should render LoadingScreen when data is loading', async () => {
    mocks.useGetPagesFromWiki.mockReturnValue({
      data: mockedData,
      isPending: true,
    });

    render(<PageList />);

    expect(screen.getByAltText('loading')).toBeInTheDocument();
  });

  it('should render error message when there is an error', async () => {
    mocks.useGetPagesFromWiki.mockReturnValue({
      data: null,
      isPending: false,
      error: new Error('Test error'),
    });
    render(<PageList />);
    expect(
      screen.getByText('An error has occurred: Test error'),
    ).toBeInTheDocument();
  });

  it('should render desktop view with List component', async () => {
    mocks.useGetPagesFromWiki.mockReturnValue({
      data: mockedData,
      isPending: false,
    });

    render(<PageList />);

    expect(screen.getByText(mockedData[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockedData[1].title)).toBeInTheDocument();
    expect(screen.getByText('wiki.read.author.publish.by')).toBeInTheDocument();
    expect(screen.getByText('wiki.read.author.update.by')).toBeInTheDocument();
  });

  it('should render mobile view with List component', async () => {
    mocks.useBreakpoint.mockReturnValue({ lg: false });

    mocks.useGetPagesFromWiki.mockReturnValue({
      data: mockedData,
      isPending: false,
    });

    const { container } = render(<PageList />);

    const badgeElement = container.querySelector('span.badge');
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('badge');
    expect(badgeElement).toHaveTextContent('wiki.table.body.visible');

    expect(screen.getByText(mockedData[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockedData[1].title)).toBeInTheDocument();
  });

  it('should render a list of actions', async () => {
    mocks.useBreakpoint.mockReturnValue({ lg: false });

    mocks.useGetPagesFromWiki.mockReturnValue({
      data: mockedData,
      isPending: false,
    });

    render(<PageList />);

    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      const ariaLabel = button.getAttribute('aria-label');
      // Check that ariaLabel matches one of the expected
      expect(mockActionItemsAriaLabel).toContain(ariaLabel);
      expect(button).toBeDisabled();
    });

    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have one checkbox checked if user clicks a checkbox', async () => {
    const { user, container } = render(<PageList />);

    // first checkbox of item of a list starts index 1, 0 is the checkbox in the toolbar
    const checkbox = screen.getAllByRole('checkbox')[1];
    const buttons = container.querySelectorAll('div.toolbar button');

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should have some buttons enabled or disabled if two checkboxes are checked', async () => {
    const { user } = render(<PageList />);

    // first checkbox of item of a list starts index 1, 0 is the checkbox in the toolbar
    const checkbox_1 = screen.getAllByRole('checkbox')[1];
    const checkbox_2 = screen.getAllByRole('checkbox')[2];
    const buttons = screen.getAllByRole('button');
    await user.click(checkbox_1);
    await user.click(checkbox_2);

    expect(checkbox_1).toBeChecked();
    expect(checkbox_2).toBeChecked();

    const hasDisabledButton = buttons.some((button) =>
      button.hasAttribute('disabled'),
    );
    expect(hasDisabledButton).toBe(true);

    const hasEnabledButton = buttons.some(
      (button) => !button.hasAttribute('disabled'),
    );
    expect(hasEnabledButton).toBe(true);
  });

  it('should render pages views counter', async () => {
    render(<PageList />);

    const viewsCounterSpan = screen.getAllByTestId('pageViewsSpan');

    expect(viewsCounterSpan).toHaveLength(mockedData.length);
  });

  describe('Views Modal', () => {
    beforeEach(() => {
      const modalRoot = document.createElement('div');
      modalRoot.id = 'portal';
      document.body.appendChild(modalRoot);
    });

    afterEach(() => {
      const modalRoot = document.getElementById('portal');
      if (modalRoot) modalRoot.remove();
    });

    it('should render ViewsModal when user clicks on views counter', async () => {
      const { user } = render(<PageList />);

      const pageViewsSpan = await screen.findAllByTestId('pageViewsSpan');
      const button = within(pageViewsSpan[0]).getByRole('button');
      expect(button).toBeInTheDocument();

      await user.click(button);

      const ViewsModal = screen.getByRole('dialog');
      expect(ViewsModal).toBeInTheDocument();
    });
  });
});
