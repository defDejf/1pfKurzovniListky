import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: '.',
    publicDir: false,
    define: {
      'process.env.REACT_APP_CSAS_URL': JSON.stringify(env.REACT_APP_CSAS_URL || ''),
      'process.env.REACT_APP_CSAS_API_KEY': JSON.stringify(env.REACT_APP_CSAS_API_KEY || ''),
      'process.env.BASE_URL': JSON.stringify(env.BASE_URL || ''),
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.useLocalEndpoint': JSON.stringify(env.useLocalEndpoint || 'false'),
    },
    server: {
      open: '/html/index.html',
    },
  };
});
