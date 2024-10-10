import { mockWikiPagesWithoutContent } from '~/mocks';
import { render, screen } from '~/mocks/setup.vitest';
import { PageList } from './list';

const mocks = vi.hoisted(() => ({
  useBreakpoint: vi.fn(),
  useDate: vi.fn(),
  useNavigate: vi.fn(),
  useGetPagesFromWiki: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const router = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return {
    ...router,
    useNavigate: () => mocks.useNavigate,
  };
});

vi.mock('@edifice-ui/react', async () => {
  const actual = await vi.importActual('@edifice-ui/react');
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
}));

describe('Pages List', () => {
  const mockedData = mockWikiPagesWithoutContent.pages
    ?.filter((page) => page.isVisible)
    .sort((a, b) => b.modified.$date - a.modified.$date);

  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    mocks.useBreakpoint.mockReturnValue({
      lg: true,
    });

    mocks.useGetPagesFromWiki.mockReturnValue({
      data: mockedData,
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
      screen.getByText('An error has occurred: Test error')
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
      expect(ariaLabel).toMatch(/^wiki\.list\.toolbar\.action/);
      expect(button).toBeDisabled();
    });

    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have one checkbox checked if user clicks a checkbox', async () => {
    const { user } = render(<PageList />);

    // first checkbox of item of a list starts index 1, 0 is the checkbox in the toolbar
    const checkbox = screen.getAllByRole('checkbox')[1];
    const buttons = screen.getAllByRole('button');
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
      button.hasAttribute('disabled')
    );
    expect(hasDisabledButton).toBe(true);

    const hasEnabledButton = buttons.some(
      (button) => !button.hasAttribute('disabled')
    );
    expect(hasEnabledButton).toBe(true);
  });
});
