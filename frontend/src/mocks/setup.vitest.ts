import '@testing-library/jest-dom';
import { RenderOptions, render } from '@testing-library/react';
import { ReactElement } from 'react';

import '../i18n';
import { Providers } from '../providers';
import './setup.msw';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export { customRender as render };
