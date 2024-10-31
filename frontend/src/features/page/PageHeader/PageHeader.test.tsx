import { mockPage } from '~/mocks';
import { render, screen } from '~/mocks/setup';
import { PageHeader } from './PageHeader';

/**
 * Create data test for component PageHeader
 * Test render PageHeader component
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
const mockedUseSubmit = vi.fn();

vi.mock('react-router-dom', async () => {
  const router =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...router,
    useNavigate: () => mockedUseNavigate,
    useSubmit: () => mockedUseSubmit,
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

describe('PageHeader component', () => {
  beforeEach(() => {
    mocks.useUserRights.mockReturnValue(initialRights);
  });

  it('should render successfully', async () => {
    const { baseElement } = render(<PageHeader page={mockPage.pages[0]} />);

    expect(baseElement).toBeTruthy();
  });

  it('renders the avatar correctly with the correct alt text', () => {
    render(<PageHeader page={mockPage.pages[0]} />);
    expect(screen.getByAltText(/wiki.read.author.avatar/));
  });

  it('renders the formatted modified date correctly', () => {
    render(<PageHeader page={mockPage.pages[0]} />);
    expect(screen.getByText(/wiki.read.dated.updated/));
  });

  it('should not render edit button when user cannot edit', () => {
    mocks.useUserRights.mockReturnValue({
      contrib: false,
      creator: false,
      manager: false,
      read: true,
    });

    render(<PageHeader page={mockPage.pages[0]} />);

    const editButton = screen.queryByRole('button', { name: 'wiki.page.edit' });
    expect(editButton).not.toBeInTheDocument();
  });
});
