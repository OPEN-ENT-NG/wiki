import {
  mockGroup,
  mockUser,
  mockWiki,
  mockWikiPages,
  mockWikisAsResources,
} from '~/mocks';
import { render, screen, waitFor } from '~/mocks/setup';
import { DuplicateModal } from './DuplicateModal';

const mocks = vi.hoisted(() => {
  return {
    useGetWiki: vi.fn(),
    useGetPage: vi.fn(),
    useDuplicatePage: vi.fn(),
    useNavigate: vi.fn(),
    useTranslation: vi.fn(),
    useGetAllWikisAsResources: vi.fn(),
    getOpenDuplicateModal: vi.fn(),
    useWikiActions: vi.fn(),
  };
});
// Mock hooks
vi.mock('react-i18next', () => ({
  useTranslation: mocks.useTranslation,
}));

vi.mock('~/services', () => ({
  useGetWiki: mocks.useGetWiki,
  useGetPage: mocks.useGetPage,
  useGetAllWikisAsResources: mocks.useGetAllWikisAsResources,
  useDuplicatePage: mocks.useDuplicatePage,
}));

vi.mock('@edifice.io/client', () => ({
  odeServices: {
    session: vi.fn().mockReturnValue({
      getUser: vi.fn().mockResolvedValue({
        userId: mockUser.userId,
        groupsIds: [mockGroup.groupId],
      }),
    }),
  },
}));
vi.mock('~/store', () => ({
  getOpenDuplicateModal: mocks.getOpenDuplicateModal,
  useWikiActions: mocks.useWikiActions,
}));
vi.mock('react-router-dom', async () => {
  const router =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...router,
    useNavigate: () => mocks.useNavigate,
  };
});

vi.mock('@edifice.io/react/multimedia', async () => {
  const actual = await vi.importActual<
    typeof import('@edifice.io/react/multimedia')
  >('@edifice.io/react/multimedia');
  return {
    ...actual,
    InternalLinker: vi.fn(({ onSelect }) => (
      <div>
        <button
          onClick={() => onSelect([{ assetId: 'wiki2', title: 'Wiki 2' }])}
        >
          Select Wiki 2
        </button>
      </div>
    )),
  };
});

describe('DuplicateModal component', () => {
  beforeEach(() => {
    mocks.useGetWiki.mockReturnValue({ data: mockWiki, isPending: false });
    mocks.useGetPage.mockReturnValue({
      data: mockWikiPages.pages[0],
      isPending: false,
    });
    mocks.useDuplicatePage.mockReturnValue({ mutateAsync: vi.fn() });
    mocks.useTranslation.mockReturnValue({ t: (key: string) => key });
    mocks.useGetAllWikisAsResources.mockReturnValue({
      data: mockWikisAsResources,
      isPending: false,
    });
    mocks.getOpenDuplicateModal.mockReturnValue(true);
    mocks.useWikiActions.mockReturnValue({ setOpenDuplicateModal: vi.fn() });
  });

  it('should render successfully', async () => {
    // Render the component
    render(<DuplicateModal pageId="page1" wikiId="wiki1" />);
    // Wait for the alert message to be rendered
    await waitFor(() => {
      expect(screen.getByText('wiki.page.duplicate.modal.alert'));
    });
  });

  it('should call duplicate mutation when form is submitted', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({
      _id: 'page1',
    });
    mocks.useDuplicatePage.mockReturnValue({
      mutation: { mutateAsync: mockMutateAsync },
    });
    // Render the component
    const { user } = render(<DuplicateModal pageId="page1" wikiId="wiki1" />);
    // Wait for the submit button to be rendered
    await waitFor(() => {
      const submitButton = screen.getByText('wiki.page.duplicate.modal.submit');
      expect(submitButton.parentElement).toHaveAttribute('disabled');
    });
    // Select a destination wiki
    const selectWikiButton = screen.getByText('Select Wiki 2');
    await user.click(selectWikiButton);
    // Wait for the submit button to be enabled
    await waitFor(() => {
      const submitButton = screen.getByText('wiki.page.duplicate.modal.submit');
      expect(submitButton.parentElement).not.toHaveAttribute('disabled');
    });
    // Submit the form
    const submitButton = screen.getByText('wiki.page.duplicate.modal.submit');
    await user.click(submitButton);
    // Wait for the mutation to be called
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        sourceWikiId: 'wiki1',
        sourcePageId: 'page1',
        targetWikiIds: ['wiki2'],
        shouldIncludeSubPages: undefined,
      });
    });
  });
});
