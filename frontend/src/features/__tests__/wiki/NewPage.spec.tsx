import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { NewPage } from '~/features/wiki/NewPage';
import { render } from '~/mocks/setup.vitest';

describe('NewPage component', () => {
  test('rendering a component that uses useLocation', () => {
    const route = '/wiki/123456';

    render(
      <MemoryRouter initialEntries={[route]}>
        <NewPage />
      </MemoryRouter>
    );

    // verify location display is rendered
    expect(screen.getByRole('button')).toHaveTextContent(
      'wiki.create.new.page'
    );
  });
});
