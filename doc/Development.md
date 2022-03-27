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

For other options e.g. to see tests running in a real local Chrome, check the `"scripts"` key
in [`package.json`](../package.json).

## Build

### Android

These steps contain an assumption you should adjust for your local dev situation. The example is based on
using macOS and Android Studio having your most appropriate 'new' Java (new Gradle versions require
Java 11). If these things are not true, adjust or delete the `JAVA_HOME` var as appropriate.

* Set new `versionCode` and `versionName` in [android/app/build.gradle](../android/app/build.gradle)
* `JAVA_HOME="/Applications/Android Studio.app/Contents/jre/Contents/Home" ionic capacitor build android --prod`
* _If first build,_ in Android Studio choose _Build > Select Build Variant..._ and choose `release`.
* In Android Studio, go to _Build > Generate Signed Bundle / APK...
* Choose to make an Android App Bundle and use your keystore
* Upload the signed [`app-release.aab`](../android/app/release/app-release.aab) [in Google Play Console](https://play.google.com/console/u/0/developers)

### iOS

* See [this answer re build system flag](https://stackoverflow.com/a/52432058/2803757) - change in Xcode before build if necessary.
* Set new `CURRENT_PROJECT_VERSION` and `MARKETING_VERSION` in [ios/App/App.xcodeproj/project.pbxproj](../ios/App/App.xcodeproj/project.pbxproj)
* `ionic capacitor build ios --prod`
* Open `ios/App/App.xcworkspace` in Xcode, or let Capacitor do this for you
* Change target at the top to _Any iOS Device (arm64)_
* _Product > Archive_
* _Distribute App_ from the Organizer dialogue.

### Resources update

Icon and splash screen shouldn't need regenerating on each build. But if they change (in `resources/`), run:

* `npm run resources`

As a temporary [workaround](https://github.com/leonardoquevedox/capacitor-resources/issues/10#issuecomment-934244953)
for Android icon size issues, globally [install `cordova-res`](https://www.npmjs.com/package/cordova-res)
and run:

* `cordova-res android --skip-config --copy --type icon`
