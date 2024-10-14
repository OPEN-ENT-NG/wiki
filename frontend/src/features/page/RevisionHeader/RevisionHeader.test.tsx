import { mockPage } from '~/mocks';
import { render, screen } from '~/mocks/setup';
import { RevisionHeader } from './RevisionHeader';

/**
 * Create data test for component RevisionHeader
 * Test render RevisionHeader component
 * Test render Avatar component
 * Test render modified date
 */

const initialRights = {
  contrib: false,
  creator: false,
  manager: false,
  read: true,
};

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const router =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...router,
    useNavigate: () => mockedUseNavigate,
  };
});

/**
 * We mock useUserRights (store)
 */
const mocks = vi.hoisted(() => {
  return {
    useUserRights: vi.fn(),
  };
});

/**
 * We use mocks in a mock of the store
 */
vi.mock('~/store/rights', () => ({
  useUserRights: mocks.useUserRights,
}));

describe('RevisionHeader component', () => {
  beforeEach(() => {
    mocks.useUserRights.mockReturnValue(initialRights);
  });

  it('should render successfully', async () => {
    const { baseElement } = render(<RevisionHeader page={mockPage.pages[0]} />);

    expect(baseElement).toBeTruthy();
  });

  it('renders the avatar correctly with the correct alt text', () => {
    render(<RevisionHeader page={mockPage.pages[0]} />);
    expect(screen.getByAltText(/wiki.read.author.avatar/));
  });

  it('renders the formatted modified date correctly', () => {
    render(<RevisionHeader page={mockPage.pages[0]} />);
    expect(screen.getByText(/wiki.read.dated.updated/));
  });

  it('should render navigate button even if user cannot edit', () => {
    mocks.useUserRights.mockReturnValue({
      contrib: false,
      creator: false,
      manager: false,
      read: true,
    });

    render(<RevisionHeader page={mockPage.pages[0]} />);

    const editButton = screen.queryByRole('button', {
      name: 'wiki.version.latest',
    });
    expect(editButton).toBeInTheDocument();
  });

  it('should not render restore button when user cannot edit', () => {
    mocks.useUserRights.mockReturnValue({
      contrib: false,
      creator: false,
      manager: false,
      read: true,
    });

    render(<RevisionHeader page={mockPage.pages[0]} />);

    const editButton = screen.queryByRole('button', {
      name: 'wiki.version.restore',
    });
    expect(editButton).not.toBeInTheDocument();
  });
});
