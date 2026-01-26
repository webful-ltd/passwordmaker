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
  android: {
  },
  ios: {
    scheme: 'Webful PasswordMaker',
  },
  plugins: {
    CapacitorShareTarget: {
      appGroupId: "group.urlshare.uk.webful.passwordmaker",
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'webful-passwordmaker',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle : "Biometric login for capacitor sqlite"
      },
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth : false,
        biometricTitle : "Biometric login for capacitor sqlite",
        biometricSubTitle : "Log in using your biometric"
      },
      electronIsEncryption: true,
      electronWindowsLocation: "C:\\ProgramData\\CapacitorDatabases",
      electronMacLocation: "/Volumes/Development_Lacie/Development/Databases",
      electronLinuxLocation: "Databases"
    },
    PrivacyScreen: {
      enable: true,
      imageName: 'Splashscreen',
    },
    StatusBar: {
      // I've not yet found an Android 13 config that works with the modern plugins
      // and also keeps the statusbar purple to emulate edge-to-edge; this seems to
      // be the least bad option for now to at least keep it in a default system
      // style and legible.
      backgroundColor: '#a11692', // Seems useful on modern iOS still
      style: 'LIGHT',
      overlaysWebView: false,
    },
    SystemBars: {
      // This is automatically handled well on modern Android but I couldn't get
      // the legacy Android CSS from https://capacitorjs.com/docs/apis/system-bars#android-note
      // to do anything useful that didn't break any platforms.
      insetsHandling: 'css',
      hidden: false,
      animation: 'NONE'
    },
  },
  server: {
    androidScheme: 'http', // https://capacitorjs.com/docs/updating/5-0#update-androidscheme
    iosScheme: 'ionic',
  }
};

export default config;
