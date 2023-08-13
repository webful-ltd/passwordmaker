# PasswordMaker Development

## Prepare dependencies

* `npm install`

### If new to Ionic

* `npm install -g @ionic/cli`

## Run locally

* `ionic serve`
* Note that the clipboard feature is currently not available in browser.

## Test locally

To run all tests as CI does:

* `npm run ci`

### Test runtime environments

We currently run:

* Angular tests – largely component / unit tests – via Karma
* Webdriver.io e2e tests with Chromium, using CircleCI browser base and supporting orb in CI.

## Build

### Android

* Set new `versionCode` and `versionName` in [android/app/build.gradle](../android/app/build.gradle)
* `ionic capacitor build android --prod`
* _If first build,_ in Android Studio choose _Build > Select Build Variant..._ and choose `release`.
* In Android Studio, go to _Build > Generate Signed Bundle / APK...
* Choose to make an Android App Bundle and use your keystore
* Upload the signed [`app-release.aab`](../android/app/release/app-release.aab) [in Google Play Console](https://play.google.com/console/u/0/developers)

### iOS

* Set new `CURRENT_PROJECT_VERSION` and `MARKETING_VERSION` in [ios/App/App.xcodeproj/project.pbxproj](../ios/App/App.xcodeproj/project.pbxproj)
* `ionic capacitor build ios --prod`
* Open `ios/App/App.xcworkspace` in Xcode, or let Capacitor do this for you
* Change target at the top to _Any iOS Device (arm64)_
* _Product > Archive_
* _Distribute App_ from the Organizer dialogue.

## Plugins

In addition to the Ionic-standard Capacitor plugins and Clipboard (for copying passwords),
we need to build with Cordova in order to get the Cloud Settings plugin.

There is an additional Cordova dependency of that plugin, `cordova-plugin-file`. If you have
not done a settings restore, the Android build seems to work fine without the Files & Media
permission which this plugin presumably adds as an option (at least on Android 11) – but
there might be a need for the permission if you _do_ restore settings, so we have not made
efforts to override the permission request from the plugin.

## Resources update

Icon and splash screen shouldn't need regenerating on each build. But if they change (in `resources/`), run:

* `npm run resources`
