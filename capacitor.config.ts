import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.billease.app.UNC2YV5NU9',
  appName: 'BillEase',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'ionic',
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#f0fdf4',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
