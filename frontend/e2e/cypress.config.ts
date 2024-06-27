import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: {
        default: 'nx run wiki:serve',
        production: 'nx run wiki:preview',
      },
      ciWebServerCommand: 'nx run wiki:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
