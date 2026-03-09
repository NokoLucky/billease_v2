import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.billease.app',
  appName: 'BillEase',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#f0fdf4',
    },
  },
};

export default config;
