import { render, screen } from '~/mocks/setup.vitest';
import { ContentTitle } from './ContentTitle';

/**
 * Create data test for component ContentTitle
 * Test render ContentTitle component
 * Test render Avatar component
 * Test render modified date
 */

describe('ContentTitle component', () => {
  const dataTestPage = {
    _id: '1',
    title: 'Test Page',
    content: 'Test Content',
    contentPlain: 'Test Content Plain',
    author: '2',
    authorName: 'Test Atuhor Name',
    modified: {
      $date: 1709202065084,
    },
    lastContributer: 'Test Laste Contributer',
    lastContributerName: 'Test Contributeur Name',
  };
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', async () => {
    const { baseElement } = render(<ContentTitle page={dataTestPage} />);

    expect(baseElement).toBeTruthy();
  });

  it('renders the avatar correctly with the correct alt text', () => {
    render(<ContentTitle page={dataTestPage} />);
    expect(screen.getByAltText(/wiki.consul.author.avatar/));
  });

  it('renders the formatted modified date correctly', () => {
    render(<ContentTitle page={dataTestPage} />);
    expect(screen.getByText(/wiki.consult.dated.updated/));
  });
});
