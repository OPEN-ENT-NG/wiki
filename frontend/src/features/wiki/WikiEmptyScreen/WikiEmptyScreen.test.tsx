import { render, screen } from '~/mocks/setup.vitest';
import WikiEmptyScreen from './WikiEmptyScreen';

const src = '/src/assets/illu-wiki.svg';

/**
 * Block of test
 */
describe('WikiEmptyScreen', () => {
  beforeEach(() => {
    render(<WikiEmptyScreen />);
  });

  /**
   * We can use test or it (alias) to perform one test
   */
  it('should render successfully', () => {
    const { baseElement } = render(<WikiEmptyScreen />);
    expect(baseElement).toBeTruthy();
  });

  it('should render an h2', () => {
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should render a text', () => {
    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'wiki.first.emptyscreen.text'
    );
  });

  it('should render an image', async () => {
    /**
     * If image has an empty alt, findByRole will fail
     * If alt must be empty, then we can use findByAltText as a backup
     */
    const img = await screen.findByRole('img');
    expect(img).toHaveAttribute('src', src);
  });
});
