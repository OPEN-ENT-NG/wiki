import userEvent from '@testing-library/user-event';
import { render, screen } from '~/mocks/setup.vitest';
import RevisionModal from './RevisionModal';
import { useRevisionTable } from './hooks/useRevisionTable';

const mocks = vi.hoisted(() => ({
  handleOnSelectAllItems: vi.fn(),
  handleOnSelectItem: vi.fn(),
  useGetRevisionsPage: vi.fn(),
  useRevisionTable: vi.fn(),
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

vi.mock('./hooks/useRevisionTable');

const mockRevisionTableHookValue = {
  selectedItems: ['1'],
  allItemsSelected: false,
  isIndeterminate: false,
  disabledRestoreButton: false,
  disabledVersionComparison: false,
  handleOnSelectAllItems: mocks.handleOnSelectAllItems,
  handleOnSelectItem: mocks.handleOnSelectItem,
};

/**
 * We have to mock useGetRevisionsPage to get Table component to be rendered
 */

vi.mock('~/services', () => ({
  useGetRevisionsPage: mocks.useGetRevisionsPage,
}));

describe('RevisionModal', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    vi.mocked(useRevisionTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      disabledRestoreButton: true,
      disabledVersionComparison: true,
    });

    vi.mocked(mocks.useGetRevisionsPage).mockReturnValue({
      data: [
        { _id: '1', username: 'John Doe', isVisible: true, date: new Date() },
        {
          _id: '2',
          username: 'Jane Smith',
          isVisible: false,
          date: new Date(),
        },
      ],
      isLoading: false,
    });
  });

  it('should render component', async () => {
    render(<RevisionModal />);

    expect(screen.getByText('wiki.version.modal.title')).toBeInTheDocument();
    expect(screen.getByText('wiki.version.compare')).toBeInTheDocument();
    expect(screen.getByText('wiki.version.restore')).toBeInTheDocument();
  });

  it('should render LoadingScreen when isLoading is true', async () => {
    vi.mocked(mocks.useGetRevisionsPage).mockReturnValue({
      data: [],
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
    vi.mocked(useRevisionTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      disabledRestoreButton: true,
      disabledVersionComparison: false,
    });
    render(<RevisionModal />);

    const compareButton = screen.getByTestId('compare-button');

    expect(compareButton).toBeInTheDocument();
    expect(compareButton).not.toBeDisabled();
  });

  it('should disable the compare button when there are less than 2 selected items', async () => {
    vi.mocked(useRevisionTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      disabledRestoreButton: true,
      disabledVersionComparison: true,
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

  it('should enable the Restore button when one item is selected', () => {
    vi.mocked(useRevisionTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      disabledRestoreButton: false,
      disabledVersionComparison: true,
    });

    render(<RevisionModal />);

    const restoreButton = screen.getByTestId('restore-button');
    expect(restoreButton).not.toBeDisabled();
  });

  it('should have no checkbox checked', () => {
    render(<RevisionModal />);

    const checkbox = screen.getByTestId('th-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should have all checkboxes checked if all items are selected', () => {
    vi.mocked(useRevisionTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      allItemsSelected: true,
    });

    render(<RevisionModal />);

    const checkbox = screen.getByTestId('th-checkbox');

    expect(checkbox).toBeChecked();
  });

  it('should detect change when all items are selected', async () => {
    vi.mocked(useRevisionTable).mockReturnValue({
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
    vi.mocked(useRevisionTable).mockReturnValue({
      ...mockRevisionTableHookValue,
      disabledRestoreButton: false,
    });

    render(<RevisionModal />);

    const user = userEvent.setup();
    const firstCheckbox = screen.getAllByRole('checkbox')[1];
    const restoreButton = screen.getByTestId('restore-button');

    await user.click(firstCheckbox);

    expect(firstCheckbox).toBeChecked();
    expect(mocks.handleOnSelectItem).toHaveBeenCalledWith('1');
    expect(restoreButton).not.toBeDisabled();
  });
});
