import { render, screen, waitFor, fireEvent } from '~/mocks/setup';
import { describe, expect, it, vi } from 'vitest';

import { MoveModal } from './MoveModal';
import { mockTreeData } from '~/mocks';
import { useReorganizeTree } from '~/hooks/useReorganizeTree';
import { useUpdatePages } from '~/hooks/useUpdatePages';
import { useWikiActions } from '~/store';
import { getToastActions } from '~/store/toast';

const mocks = vi.hoisted(() => {
  return {
    mockGetPage: vi.fn(),
    mockGetPagesFromWiki: vi.fn(),
    reorganize: vi.fn(),
    transformToUpdateData: vi.fn(),
    handleSortPage: vi.fn(),
    setOpenMoveModal: vi.fn(),
    addToastMessage: vi.fn(),
  };
});
// Mock hooks
vi.mock('~/hooks/useReorganizeTree', () => ({
  useReorganizeTree: () => ({
    reorganize: mocks.reorganize,
    transformToUpdateData: mocks.transformToUpdateData,
  }),
}));

vi.mock('~/hooks/useUpdatePages', () => ({
  useUpdatePages: () => ({
    handleSortPage: mocks.handleSortPage,
  }),
}));

vi.mock('~/store', () => ({
  useOpenMoveModal: () => true,
  useTreeData: () => mockTreeData,
  useWikiActions: () => ({
    setOpenMoveModal: mocks.setOpenMoveModal,
  }),
}));

vi.mock('~/store/toast', () => ({
  getToastActions: () => ({
    addToastMessage: mocks.addToastMessage,
  }),
}));

describe('MoveModal', () => {
  const defaultProps = {
    wikiId: '123',
    pageId: '456',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockGetPage.mockResolvedValue({ title: 'Test Page' });
    mocks.mockGetPagesFromWiki.mockResolvedValue(mockTreeData);
  });

  it('should render correctly', async () => {
    render(<MoveModal {...defaultProps} />);

    // Check if the title is rendered
    await waitFor(() => {
      expect(screen.getByText('wiki.move.title')).toBeInTheDocument();
    });

    // Check if the alert is rendered
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByText('wiki.move.button').parentElement).toBeDisabled();
    expect(screen.getByText('wiki.move.cancel').parentElement).toBeEnabled();
  });

  it('should enable move button when destination is selected', async () => {
    render(<MoveModal {...defaultProps} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('wiki.move.title')).toBeInTheDocument();
    });

    // Simulate selecting a destination
    const treeItem = screen.getByText(mockTreeData[0].name);
    fireEvent.click(treeItem);

    // Check if the move button is enabled
    expect(screen.getByText('wiki.move.button').parentElement).toBeEnabled();
  });

  it('should handle move action', async () => {
    const { reorganize } = useReorganizeTree();
    const { handleSortPage } = useUpdatePages('123');
    const { setOpenMoveModal } = useWikiActions();
    const { addToastMessage } = getToastActions();

    render(<MoveModal {...defaultProps} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('wiki.move.title')).toBeInTheDocument();
    });

    // Select a destination and move
    fireEvent.click(screen.getByText(mockTreeData[0].name));

    // Click the move button
    fireEvent.click(screen.getByText('wiki.move.button'));

    // Check if functions are called
    await waitFor(() => {
      expect(reorganize).toHaveBeenCalled();
      expect(handleSortPage).toHaveBeenCalled();
      expect(setOpenMoveModal).toHaveBeenCalledWith(false);
      expect(addToastMessage).toHaveBeenCalledWith({
        type: 'success',
        text: 'wiki.move.success',
      });
    });
  });

  it('should handle error during move', async () => {
    const { addToastMessage } = getToastActions();

    // Simulate an error during move
    vi.mocked(mocks.reorganize).mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<MoveModal {...defaultProps} />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('wiki.move.title')).toBeInTheDocument();
    });
    // Select a destination and move
    fireEvent.click(screen.getByText(mockTreeData[0].name));
    fireEvent.click(screen.getByText('wiki.move.button'));

    // Check if error message is shown
    await waitFor(() => {
      expect(addToastMessage).toHaveBeenCalledWith({
        type: 'error',
        text: 'wiki.move.error',
      });
    });
  });
});
