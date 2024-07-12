import { WikiEmptyScreen } from './index';

import { render } from '../../mocks/setup.vitest';

describe('WikiEmptyScreen', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WikiEmptyScreen />);

    expect(baseElement).toBeTruthy();
  });

  it('should render a title', () => {
    const { getByTestId } = render(<WikiEmptyScreen />);
    expect(getByTestId('emptyscreen-title')).toBeInTheDocument();
  });

  it('title should be h2 level', () => {
    const { getByRole } = render(<WikiEmptyScreen />);
    expect(getByRole('heading', { level: 2 }));
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
