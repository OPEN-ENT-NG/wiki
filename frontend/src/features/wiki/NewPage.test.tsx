import userEvent from '@testing-library/user-event';
import { render, renderWithRouter, screen } from '~/mocks/setup.vitest';
import { CreatePage } from '~/routes/page/create';
import { NewPage } from './NewPage';

/**
 * Mock React Router and useNavigate hook
 * We import and mock router but especially useNavigate hook
 * useNavigate hook is called inside our component
 * Without mocking it, it will crash an error
 */
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

describe('NewPage component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', async () => {
    const { baseElement } = render(<NewPage />);

    expect(baseElement).toBeTruthy();
  });

  it('should trigger useNavigate hook', async () => {
    /**
     * We are getting a 'user' with @testing-library/user-event
     */
    const user = userEvent.setup();

    /**
     * As we mocked useNavigate, we can just render the component
     */
    render(<NewPage />);

    /**
     * We find the button in the component by role (better than by test-id)
     */
    await screen.findByRole('button');

    /**
     * We use @testing-library/user-event to simulate user click
     * button should have a i18n key expected
     */
    await user.click(
      screen.getByRole('button', { name: /wiki.create.new.page/i })
    );
    /**
     * Then, when user clicks,
     * We expect navigate(`page/create`) in handleCreatePage fn to have been called
     */
    expect(mockedUseNavigate).toHaveBeenCalledWith(`page/create`);
  });

  it('navigates to create page when button clicked', async () => {
    /**
     * We render the expected page when useNavigate is used
     * We are navigating to `page/create`
     */
    // renderWithRouter('/', <CreatePage />);

    renderWithRouter('/', <CreatePage />, `/`);

    /**
     * We "await" to be in the page and find our element (h1)
     */
    // await waitFor(() => screen.getByRole('heading'));
    await screen.findByRole('heading');
    /**
     * In our "create page", we expect <h1> with a text inside
     */
    expect(screen.getByRole('heading')).toHaveTextContent(
      "Création d'une page"
    );
  });
});
