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

* See [this answer re build system flag](https://stackoverflow.com/a/52432058/2803757) - change in Xcode before build if necessary.
* `ionic cordova build ios --prod`
* Open `platforms/ios/Webful PasswordMaker.xcworkspace` in Xcode.
* Change target at the top to _Generic iOS Device_
* _Product > Archive_
* _Distribute App_ from the Organizer dialogue.
