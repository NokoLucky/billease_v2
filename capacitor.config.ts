import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.billease.app.UNC2YV5NU9',
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
