import userEvent from '@testing-library/user-event';
import { useCheckableTable } from '~/hooks/useCheckableTable';
import { mockRevision } from '~/mocks';
import { render, screen } from '~/mocks/setup.vitest';
import RevisionModal from './RevisionModal';

const mocks = vi.hoisted(() => ({
  handleOnSelectAllItems: vi.fn(),
  handleOnSelectItem: vi.fn(),
  useGetRevisionsPage: vi.fn(),
  useCheckableTable: vi.fn(),
  setOpenRevisionModal: vi.fn(),
}));

/**
 * We mock createPortal to open RevisionModal
 */
vi.mock('react-dom', async () => {
  const dom = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...dom,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock('~/store/wiki', () => ({
  useOpenRevisionModal: () => true,
  useWikiActions: () => ({
    setOpenRevisionModal: mocks.setOpenRevisionModal,
  }),
}));

vi.mock('~/services', () => ({
  useGetRevisionsPage: mocks.useGetRevisionsPage,
}));

vi.mock('~/hooks/useCheckableTable');

const mockRevisionTableHookValue = {
  selectedItems: [mockRevision[0]._id, mockRevision[1]._id],
  allItemsSelected: false,
  isIndeterminate: false,
  handleOnSelectAllItems: mocks.handleOnSelectAllItems,
  handleOnSelectItem: mocks.handleOnSelectItem,
};

describe('RevisionModal', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    vi.mocked(useCheckableTable).mockReturnValue(mockRevisionTableHookValue);

    vi.mocked(mocks.useGetRevisionsPage).mockReturnValue({
      data: mockRevision,
      isLoading: false,
    });
  });

  it('should render component', async () => {
    render(<RevisionModal />);

    expect(screen.getByText('wiki.version.modal.title')).toBeInTheDocument();
    expect(screen.getByText('wiki.version.compare')).toBeInTheDocument();
    expect(screen.getByText('wiki.version.restore')).toBeInTheDocument();
  });

  it('should render LoadingScreen when data is loading', async () => {
    vi.mocked(mocks.useGetRevisionsPage).mockReturnValue({
      data: mockRevision,
      isLoading: true,
    });

    render(<RevisionModal />);

    expect(screen.getByAltText('loading')).toBeInTheDocument();
  });

  it('should have title', () => {
    render(<RevisionModal />);

    expect(screen.getByText('wiki.version.modal.title')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should close RevisionModal when user clicks on cancel button', async () => {
    render(<RevisionModal />);

    const user = userEvent.setup();
    const closeBtn = screen.getByTestId('cancel-button');
    await user.click(closeBtn);

    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).not.toBeDisabled();
    expect(mocks.setOpenRevisionModal).toHaveBeenCalledWith(false);
  });

  it('should close RevisionModal when user clicks close btn', async () => {
    render(<RevisionModal />);

    const user = userEvent.setup();
    const closeBtn = screen.getByTitle('close');
    await user.click(closeBtn);

    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).not.toBeDisabled();
    expect(mocks.setOpenRevisionModal).toHaveBeenCalledWith(false);
  });

  it('should enable the compare button when there are 2 selected items', async () => {
    render(<RevisionModal />);

    const compareButton = screen.getByTestId('compare-button');

    expect(compareButton).toBeInTheDocument();
    expect(compareButton).not.toBeDisabled();
  });

  it('should disable the compare button when there are less than 2 selected items', async () => {
    vi.mocked(useCheckableTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      selectedItems: [mockRevision[0]._id],
    });

    render(<RevisionModal />);

    const compareButton = screen.getByTestId('compare-button');

    expect(compareButton).toBeInTheDocument();
    expect(compareButton).toBeDisabled();
  });

  it('should disable the Restore button when multiple items are selected or conditions are not met', () => {
    render(<RevisionModal />);

    const restoreButton = screen.getByTestId('restore-button');
    expect(restoreButton).toBeDisabled();
  });

  it('should enable the Restore button when one item is selected', async () => {
    vi.mocked(useCheckableTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      selectedItems: [mockRevision[0]._id],
    });

    render(<RevisionModal />);

    const user = userEvent.setup();
    const checkbox = screen.getAllByRole('checkbox')[1];
    const restoreButton = screen.getByTestId('restore-button');

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(mocks.handleOnSelectItem).toHaveBeenCalledWith(mockRevision[0]._id);
    expect(restoreButton).not.toBeDisabled();
  });

  it('should have no checkbox checked', () => {
    render(<RevisionModal />);

    const checkbox = screen.getByTestId('th-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should detect change when all items are selected', async () => {
    vi.mocked(useCheckableTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      allItemsSelected: true,
    });

    render(<RevisionModal />);

    const user = userEvent.setup();
    const checkbox = screen.getByTestId('th-checkbox');
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(mocks.handleOnSelectAllItems).toHaveBeenCalledWith(true);
  });

  it('should have one checkbox checked if user clicks a checkbox', async () => {
    render(<RevisionModal />);

    const user = userEvent.setup();
    const checkbox = screen.getAllByRole('checkbox')[1];
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(mocks.handleOnSelectItem).toHaveBeenCalledWith(mockRevision[0]._id);
  });
});
