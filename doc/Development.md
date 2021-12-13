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

* `ionic capacitor build android --prod`
* In Android Studio, go to Build > Generate Signed Bundle / APK...
* Choose to make bundle and use your keystore

### iOS

* See [this answer re build system flag](https://stackoverflow.com/a/52432058/2803757) - change in Xcode before build if necessary.
* `ionic capacitor build ios --prod`
* Open `ios/App/App.xcworkspace` in Xcode, or let Capacitor do this for you
* Change target at the top to _Any iOS Device_
* _Product > Archive_
* _Distribute App_ from the Organizer dialogue.
