import userEvent from '@testing-library/user-event';
import React from 'react';
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

vi.mock('@edifice-ui/editor', () => ({
  Editor: React.forwardRef(() => <div />),
}));

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
    renderWithRouter('/', `/`, <CreatePage />);

    /**
     * We "await" to be in the page and find our element (h1)
     */
    // await waitFor(() => screen.getByRole('heading'));
    await screen.findByRole('form');
    /**
     * In our "create page", we expect <form> is defined
     */
    expect(screen.findByRole('form')).toBeDefined();
    /**
     * In our "create page", we expect <toggle> is defined
     */
    expect(screen.findByRole('toggle')).toBeDefined();
    /**
     * In our "create page", we expect we have our Buttons Cancel and Save
     */
    expect(screen.getByRole('button', { name: /wiki.editform.cancel/i }));
    expect(screen.getByRole('button', { name: /save/i }));
  });
});
