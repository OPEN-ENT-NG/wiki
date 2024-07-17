import { AppHeader, Breadcrumb } from '@edifice-ui/react';
import { render, screen, waitFor } from '~/mocks/setup.vitest';

describe('AppHeader component', () => {
  /* beforeEach(() => {
    mocks.useUserRights.mockImplementation(() => initialRights);
  }); */
  /* afterEach(() => {
    vi.clearAllMocks();
  }); */

  it('should render successfully', async () => {
    const { baseElement } = render(
      <AppHeader>
        <Breadcrumb
          app={{
            address: '',
            display: false,
            displayName: 'wiki',
            icon: '',
            isExternal: false,
            name: 'wiki',
            scope: [],
          }}
          name="Mock Title"
        ></Breadcrumb>
      </AppHeader>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a navigation', async () => {
    render(
      <AppHeader>
        <Breadcrumb
          app={{
            address: '',
            display: false,
            displayName: 'wiki',
            icon: '',
            isExternal: false,
            name: 'wiki',
            scope: [],
          }}
          name="Mock Title"
        ></Breadcrumb>
      </AppHeader>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should have a heading with title', async () => {
    render(
      <AppHeader>
        <Breadcrumb
          app={{
            address: '',
            display: false,
            displayName: 'wiki',
            icon: '',
            isExternal: false,
            name: 'wiki',
            scope: [],
          }}
          name="Mock Title"
        ></Breadcrumb>
      </AppHeader>
    );

    const heading = screen.getByRole('heading', { level: 1 });

    await waitFor(() => {
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Mock Title');
    });
  });
});
