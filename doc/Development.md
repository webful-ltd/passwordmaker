# PasswordMaker Development

## Prepare dependencies

Because of a Cordova plugin's convention of keeping a sensitive value in `package.json`, for now
this is rather unusually excluded from source control.

We should probably replace this with a better solution at some point. In the mean time, to start:

* `cp package.json.dist package.json`
* `npm install`

## Run locally

* `ionic serve`
* Note that the clipboard feature is currently not available in browser.

## Test locally

To run all tests as CI does:

* `npm run ci` 

## Build

### Android

* Set new `versionCode` and `versionName` in [android/app/build.gradle](../android/app/build.gradle)
* `ionic capacitor build android --prod`
* In Android Studio, go to Build > Generate Signed Bundle / APK...
* Choose to make an Android App Bundle and use your keystore

### iOS

* See [this answer re build system flag](https://stackoverflow.com/a/52432058/2803757) - change in Xcode before build if necessary.
* Set new `CURRENT_PROJECT_VERSION` and `MARKETING_VERSION` in [ios/App/App.xcodeproj/project.pbxproj](../ios/App/App.xcodeproj/project.pbxproj)
* `ionic capacitor build ios --prod`
* Open `ios/App/App.xcworkspace` in Xcode, or let Capacitor do this for you
* Change target at the top to _Any iOS Device_
* _Product > Archive_
* _Distribute App_ from the Organizer dialogue.
