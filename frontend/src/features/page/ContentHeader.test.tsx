import { mockPage } from '~/mocks';
import { render } from '~/mocks/setup.vitest';
import { ContentHeader } from './ContentHeader';

/**
 * Create data test for component ContentHeader
 * Test render ContentHeader component
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
  const router = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
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

describe('ContentHeader component', () => {
  beforeEach(() => {
    mocks.useUserRights.mockImplementation(() => initialRights);
  });

  it('should render successfully', async () => {
    const { baseElement } = render(<ContentHeader page={mockPage.pages[0]} />);

    expect(baseElement).toBeTruthy();
  });

  /* it('renders the avatar correctly with the correct alt text', () => {
    render(<ContentHeader page={mockPage.pages[0]} />);
    expect(screen.getByAltText(/wiki.read.author.avatar/));
  }); */

  /* it('renders the formatted modified date correctly', () => {
    render(<ContentHeader page={mockPage.pages[0]} />);
    expect(screen.getByText(/wiki.read.dated.updated/));
  }); */

  /* it('should not render edit button when userCanEdit is false', () => {
    mocks.useUserRights.mockImplementation(() => ({
      contrib: false,
      creator: false,
      manager: true,
      read: false,
    }));

    render(<ContentHeader page={mockPage.pages[0]} />);

    const editButton = screen.queryByRole('button', { name: 'wiki.page.edit' });
    expect(editButton).not.toBeInTheDocument();
  }); */
});
