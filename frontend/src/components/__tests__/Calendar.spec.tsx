import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CalendarEvent } from '../Calendar';

test('event route', async () => {
  render(<CalendarEvent />);
  await waitFor(() => screen.getByRole('heading'));
  expect(screen.getByRole('heading')).toHaveTextContent('test even');
});

test('rendering a component that uses useLocation', () => {
  const route = '/some-route';

  render(
    <MemoryRouter initialEntries={[route]}>
      <CalendarEvent />
    </MemoryRouter>
  );

  // verify location display is rendered
  expect(screen.getByRole('heading')).toHaveTextContent('test even');
});
