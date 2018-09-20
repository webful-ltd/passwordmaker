# PasswordMaker Development

## Run locally

* `ionic serve`
* Note that the clipboard feature is currently not available in browser.

## Build

### Android

* Configure your local `.env` - copy from `.env.example` if missing.
* Run: `./build-helpers/android.sh`
* Enter signing key's password if prompted.
* Signed `PasswordMaker.apk` is created in the project root.

### iOS

* `ionic cordova build ios --prod`
* Open `platforms/ios/Webful PasswordMaker.xcworkspace` in Xcode.
* Change target at the top to _Generic iOS Device_
* _Product > Archive_
* _Upload to App Store_ from the Organizer dialogue.
