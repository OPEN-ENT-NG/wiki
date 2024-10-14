import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { mockWikiPages } from '~/mocks';
import { render, screen } from '~/mocks/setup';
import DeleteListModal from './DeleteListModal';

const mocks = vi.hoisted(() => ({
  setOpenDeleteModal: vi.fn(),
  useUserRights: vi.fn(),
  useFetcher: vi.fn(),
}));

/**
 * We mock createPortal to open DeleteListModal
 */
vi.mock('react-dom', async () => {
  const dom = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...dom,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock('react-router-dom', async () => {
  const router =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...router,
    useFetcher: () => ({
      Form: ({ children, ...props }: { children: ReactNode }) => (
        <form {...props}>{children}</form>
      ),
    }),
  };
});

/**
 * We use mocks in a mock of the store
 */
vi.mock('~/store/rights', () => ({
  useUserRights: mocks.useUserRights,
}));

vi.mock('~/store/wiki', () => ({
  useOpenDeleteModal: () => true,
  useWikiActions: () => ({
    setOpenDeleteModal: mocks.setOpenDeleteModal,
  }),
}));

const initialRights = {
  contrib: false,
  creator: false,
  manager: false,
  read: true,
};

const selectedPages = [mockWikiPages.pages[0]._id, mockWikiPages.pages[1]._id];

describe('DeleteListModal', () => {
  beforeEach(() => {
    mocks.useUserRights.mockReturnValue(initialRights);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render component', () => {
    const { baseElement } = render(
      <DeleteListModal selectedPages={selectedPages} />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a title', async () => {
    render(<DeleteListModal selectedPages={selectedPages} />);

    expect(
      screen.getByText('wiki.modal.delete.page.header'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should close DeleteListModal when user clicks on cancel button', async () => {
    render(<DeleteListModal selectedPages={selectedPages} />);

    const user = userEvent.setup();
    const closeBtn = screen.getByTestId('cancel-button');
    await user.click(closeBtn);

    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).not.toBeDisabled();
    expect(mocks.setOpenDeleteModal).toHaveBeenCalledWith(false);
  });

  it('should close RevisionModal when user clicks close btn', async () => {
    render(<DeleteListModal selectedPages={selectedPages} />);

    const user = userEvent.setup();
    const closeBtn = screen.getByTitle('close');
    await user.click(closeBtn);

    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).not.toBeDisabled();
    expect(mocks.setOpenDeleteModal).toHaveBeenCalledWith(false);
  });

  it('should render alert component if user is not manager', () => {
    render(<DeleteListModal selectedPages={selectedPages} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should not render alert component if user is manager', () => {
    mocks.useUserRights.mockReturnValue({
      contrib: true,
      creator: false,
      manager: true,
      read: true,
    });

    render(<DeleteListModal selectedPages={selectedPages} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render fetcher.Form and submit form', async () => {
    window.addEventListener('submit', (event) => {
      event.preventDefault();
    });

    render(<DeleteListModal selectedPages={selectedPages} />);

    const user = userEvent.setup();
    const submitButton = screen.getByTestId('delete-button');

    await user.click(submitButton);

    expect(mocks.setOpenDeleteModal).toHaveBeenCalledWith(false);
  });
});
