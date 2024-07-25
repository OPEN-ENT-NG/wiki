import { render, screen } from '~/mocks/setup.vitest';
import { ContentTitle } from './ContentHeader';
import { mockPage } from '~/mocks';

/**
 * Create data test for component ContentTitle
 * Test render ContentTitle component
 * Test render Avatar component
 * Test render modified date
 */

describe('ContentTitle component', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(<ContentTitle page={mockPage.pages[0]} />);

    expect(baseElement).toBeTruthy();
  });

  it('renders the avatar correctly with the correct alt text', () => {
    render(<ContentTitle page={mockPage.pages[0]} />);
    expect(screen.getByAltText(/wiki.read.author.avatar/));
  });

  it('renders the formatted modified date correctly', () => {
    render(<ContentTitle page={mockPage.pages[0]} />);
    expect(screen.getByText(/wiki.read.dated.updated/));
  });
});
