import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.webful.passwordmaker',
  appName: 'Webful PasswordMaker',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      permissions: 'none',
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      MixedContentMode: '1',
    }
  },
  ios: {
    scheme: 'Webful PasswordMaker',
  },
  server: {
    androidScheme: 'http', // https://capacitorjs.com/docs/updating/5-0#update-androidscheme
    iosScheme: 'ionic',
  }
};

export default config;
