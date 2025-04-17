import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'test-pwa',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;
