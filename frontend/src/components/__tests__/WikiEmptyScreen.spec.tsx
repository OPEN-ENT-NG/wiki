import { render } from '../../mocks/setup.vitest';
import WikiEmptyScreen from '../WikiEmptyScreen';

describe('WikiEmptyScreen', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WikiEmptyScreen />);

    expect(baseElement).toBeTruthy();
  });

  describe('test title to be rendered', () => {
    it('title is rendered', () => {
      const { getByTestId } = render(<WikiEmptyScreen />);
      expect(getByTestId('emptyscreen-title')).toBeInTheDocument();
    });

    it('title should be h2 level', () => {
      const { getByRole } = render(<WikiEmptyScreen />);
      expect(getByRole('heading', { level: 2 }));
    });
  });

  it('should render a text', () => {
    const { getByTestId } = render(<WikiEmptyScreen />);
    expect(getByTestId('emptyscreen-text')).toBeInTheDocument();
  });

  it('should render an image', () => {
    const { getByAltText } = render(<WikiEmptyScreen />);
    const src = '/src/assets/illu-wiki.svg';

    expect(getByAltText('')).toHaveAttribute('src', src);
  });
});
