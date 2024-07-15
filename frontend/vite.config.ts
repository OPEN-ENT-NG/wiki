/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default ({ mode }: { mode: string }) => {
  // Checking environement files
  const envFile = loadEnv(mode, process.cwd());
  const envs = { ...process.env, ...envFile };
  const hasEnvFile = Object.keys(envFile).length;

  // Proxy variables
  const headers = hasEnvFile
    ? {
        'set-cookie': [
          `oneSessionId=${envs.VITE_ONE_SESSION_ID}`,
          `XSRF-TOKEN=${envs.VITE_XSRF_TOKEN}`,
        ],
        'Cache-Control': 'public, max-age=300',
      }
    : {};

  const proxyObj = hasEnvFile
    ? {
        target: envs.VITE_RECETTE,
        changeOrigin: true,
        headers: {
          cookie: `oneSessionId=${envs.VITE_ONE_SESSION_ID};authenticated=true; XSRF-TOKEN=${envs.VITE_XSRF_TOKEN}`,
        },
      }
    : {
        target: 'http://localhost:8090',
        changeOrigin: false,
      };

  /* Replace "/" the name of your application (e.g : blog | mindmap | collaborativewall) */
  return defineConfig({
    base: mode === 'production' ? '/wiki' : '',
    root: __dirname,
    cacheDir: './node_modules/.vite/wiki',

    server: {
      proxy: {
        '/applications-list': proxyObj,
        '/conf/public': proxyObj,
        '^/(?=help-1d|help-2d)': proxyObj,
        '^/(?=assets)': proxyObj,
        '^/(?=theme|locale|i18n|skin)': proxyObj,
        '^/(?=auth|appregistry|cas|userbook|directory|communication|conversation|portal|session|timeline|workspace|infra)':
          proxyObj,
        '/xiti': proxyObj,
        '/analyticsConf': proxyObj,
        '/explorer': proxyObj,
        '/wiki': proxyObj,
      },
      port: 4200,
      headers,
      host: 'localhost',
    },

    preview: {
      port: 4300,
      headers,
      host: 'localhost',
    },

    plugins: [react(), nxViteTsPaths()],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    build: {
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: false,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      assetsDir: 'public',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: ['edifice-ts-client' /* 'ode-explorer/lib' */],
        output: {
          paths: {
            'edifice-ts-client': '/assets/js/edifice-ts-client/index.js',
            /* 'ode-explorer/lib':
              'https://cdn.jsdelivr.net/npm/ode-explorer@1.4.13-develop-pedago.202407031810/lib/+esm', */
          },
        },
      },
    },

    test: {
      watch: false,
      globals: true,
      cache: {
        dir: './node_modules/.vitest/wiki',
      },
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: ['./src/mocks/setup.vitest.tsx'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: './coverage/wiki',
        provider: 'v8',
      },
    },
  });
};
