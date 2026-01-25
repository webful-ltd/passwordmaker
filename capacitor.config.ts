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
      // Work around title position issues with Android API 35 for now.
      // See https://github.com/ionic-team/ionic-framework/issues/30090#issuecomment-2708500924
      // See also discussion & alternatives at https://github.com/ionic-team/capacitor/issues/7804 and
      // https://github.com/ionic-team/ionic-framework/issues/30090
      // Possibly consider @capawesome/capacitor-android-edge-to-edge-support if we find issues
      // beyond the statusbar.
      // See also `android/app/src/main/res/values/styles.xml` temporary workarounds to allow nice statusbars
      // on Android 15 and 16 for now.
      overlaysWebView: false,
    }
  },
  server: {
    androidScheme: 'http', // https://capacitorjs.com/docs/updating/5-0#update-androidscheme
    iosScheme: 'ionic',
  }
};

export default config;
