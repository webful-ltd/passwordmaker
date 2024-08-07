import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.webful.passwordmaker',
  appName: 'Webful PasswordMaker',
  webDir: 'www/browser',
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
  plugins: {
    PrivacyScreen: {
      enable: true,
      imageName: 'Splashscreen',
    },
  },
  server: {
    androidScheme: 'http', // https://capacitorjs.com/docs/updating/5-0#update-androidscheme
    iosScheme: 'ionic',
  }
};

export default config;
