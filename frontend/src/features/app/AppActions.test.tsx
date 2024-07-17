import { mockWiki } from '~/mocks';
import { render, renderHook, screen, waitFor } from '~/mocks/setup.vitest';
import { Providers } from '~/providers';
import { useGetWiki } from '~/services';
import { useWikiActions } from '~/store';
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
  contrib: false,
  creator: false,
  manager: false,
  read: true,
};

const mocks = vi.hoisted(() => {
  return {
    useUserRights: vi.fn(),
  };
});

vi.mock('~/store/rights', () => ({
  useUserRights: mocks.useUserRights,
}));

//

describe('AppActions component', () => {
  beforeEach(() => {
    mocks.useUserRights.mockImplementation(() => initialRights);
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

  it('should render the print button when isOnlyRead is true', async () => {
    render(<AppActions />);

    const printButton = screen.getByTestId('print-button');
    expect(printButton).toBeInTheDocument();
  });

  it('should render the dropdown menu when isOnlyRead is false', () => {
    mocks.useUserRights.mockImplementation(() => ({
      contrib: false,
      creator: false,
      manager: false,
      read: false,
    }));
    render(<AppActions />);
    const dropdownButton = screen.getByTestId('dropdown');
    expect(dropdownButton).toBeInTheDocument();
  });

  /* it('should call useUserRights to get user rights', async () => {
    render(<AppActions />);

    const { result } = renderHook(() => useUserRights(), {
      wrapper: Providers,
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual(initialRights);
    });
  }); */

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
