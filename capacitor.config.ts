import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.billease.app',
  appName: 'BillEase',
  webDir: 'out',
  server: {
    // To handle CORS in development
    cleartext: true
  },
  ios: {
    // Allow arbitrary loads for external APIs if needed
    scheme: 'https'
  }
};

export default config;
