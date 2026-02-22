import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: '.',
    publicDir: false,
    define: {
      'process.env.REACT_APP_CSAS_URL': JSON.stringify(env.REACT_APP_CSAS_URL || ''),
      'process.env.REACT_APP_CSAS_API_KEY': JSON.stringify(env.REACT_APP_CSAS_API_KEY || ''),
    },
    server: {
      open: '/html/index.html',
    },
  };
});
