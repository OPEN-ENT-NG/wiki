import { mockWiki } from '~/mocks';
import { render, renderHook, screen, waitFor } from '~/mocks/setup.vitest';
import { Providers } from '~/providers';
import { useGetWiki } from '~/services';
import { useUserRights, useWikiActions } from '~/store';
import { AppActions } from './AppActions';

/**
 * Mock React Router and useNavigate hook
 * We import and mock router but especially useNavigate hook
 * useNavigate hook is called inside our component
 * Without mocking it, it will crash an error
 */
vi.mock('react-router-dom', () => ({
  useParams: () => ({ wikiId: '123' }),
}));

const initialRights = {
  contrib: true,
  creator: false,
  manager: true,
  read: true,
};

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

//

describe('AppActions component', () => {
  /**
   * Before each test, we init the implementation of our mock => default to isOnlyRead
   */
  beforeEach(() => {
    mocks.useUserRights.mockReturnValue(initialRights);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', async () => {
    const { baseElement } = render(<AppActions />);
    expect(baseElement).toBeTruthy();
  });

  it('should call useGetWikis hook', async () => {
    render(<AppActions />);

    const { result } = renderHook(() => useGetWiki(mockWiki._id), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should render the print button when canManage is false', async () => {
    /**
     * In this test only, we change the return value of our mock to test another condition -> isOnlyRead = false
     */
    mocks.useUserRights.mockReturnValue({
      contrib: true,
      creator: false,
      manager: false,
      read: true,
    });
    render(<AppActions />);

    const printButton = screen.getByTestId('print-button');
    expect(printButton).toBeInTheDocument();
  });

  it('should render the dropdown menu when canManage is true', () => {
    render(<AppActions />);
    const dropdownButton = screen.getByTestId('dropdown');
    expect(dropdownButton).toBeInTheDocument();
  });

  it('should call useUserRights to get user rights', async () => {
    render(<AppActions />);

    const { result } = renderHook(() => useUserRights(), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual(initialRights);
    });
  });

  it('should call useWikiActions and destructure methods', async () => {
    render(<AppActions />);

    const { result } = renderHook(() => useWikiActions(), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current.setOpenUpdateModal).toBeDefined();
      expect(result.current.setOpenShareModal).toBeDefined();
    });
  });
});
