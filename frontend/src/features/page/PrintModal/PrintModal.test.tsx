import userEvent from '@testing-library/user-event';
import { useCheckablePrint } from '~/hooks/useCheckablePrint/useCheckablePrint';
import { render, screen } from '~/mocks/setup.vitest';
import PrintModal from './PrintModal';

const mocks = vi.hoisted(() => ({
  handleOnGroupChange: vi.fn(),
  handleOnPrintComment: vi.fn(),
  handleOnPrintWiki: vi.fn(),
  usePrintPage: vi.fn(),
  setOpenPrintModal: vi.fn(),
}));

type PrintGroup = 'allPages' | 'onePage';

/**
 * We mock createPortal to open PrintModal
 */
vi.mock('react-dom', async () => {
  const dom = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...dom,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock('~/store/wiki', () => ({
  useOpenPrintModal: () => true,
  useWikiActions: () => ({
    setOpenPrintModal: mocks.setOpenPrintModal,
  }),
}));

vi.mock('~/hooks/useCheckablePrint/useCheckablePrint');

const mockPrintModalHookValue = {
  handleOnGroupChange: mocks.handleOnGroupChange,
  handleOnPrintComment: mocks.handleOnPrintComment,
  handleOnPrintWiki: mocks.handleOnPrintComment,
  printComment: false,
  printGroup: 'onePage' as PrintGroup,
};

describe('PrintModal', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    vi.mocked(useCheckablePrint).mockReturnValue(mockPrintModalHookValue);
  });

  it('should render component', async () => {
    render(<PrintModal />);

    expect(screen.getByText('wiki.modal.print.header')).toBeInTheDocument();
    expect(screen.getByText('wiki.modal.print.radio.page')).toBeInTheDocument();
    expect(
      screen.getByText('wiki.modal.print.radio.pages')
    ).toBeInTheDocument();
    expect(
      screen.getByText('wiki.modal.print.checkbox.label')
    ).toBeInTheDocument();
    expect(
      screen.getByText('wiki.modal.print.button.print')
    ).toBeInTheDocument();
  });

  it('should have title', () => {
    render(<PrintModal />);

    expect(screen.getByText('wiki.modal.print.header')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should close PrintModal when user clicks on cancel button', async () => {
    render(<PrintModal />);

    const user = userEvent.setup();
    const closeBtn = screen.getByTestId('cancel-button');
    await user.click(closeBtn);

    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).not.toBeDisabled();
    expect(mocks.setOpenPrintModal).toHaveBeenCalledWith(false);
  });

  it('should have no checkbox checked', () => {
    render(<PrintModal />);

    const checkbox = screen.getByTestId('th-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should handles Radio group change', async () => {
    const { handleOnGroupChange } = useCheckablePrint();

    render(<PrintModal />);
    const user = userEvent.setup();
    const allPagesRadio = screen.getByLabelText('wiki.modal.print.radio.pages');
    await user.click(allPagesRadio);

    expect(handleOnGroupChange).toHaveBeenCalled();
  });

  it('should handles Checkbox toggle for printing comments', async () => {
    const { handleOnPrintComment } = useCheckablePrint();

    render(<PrintModal />);
    const user = userEvent.setup();
    const checkbox = screen.getByLabelText('wiki.modal.print.checkbox.label');
    await user.click(checkbox);

    expect(handleOnPrintComment).toHaveBeenCalled();
  });

  it('should print button is rendered and clickable', async () => {
    render(<PrintModal />);
    const user = userEvent.setup();
    const printButton = screen.getByText('wiki.modal.print.button.print');
    await user.click(printButton);

    expect(printButton).toBeInTheDocument();
  });
});
