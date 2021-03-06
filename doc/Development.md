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

* Configure your local `.env` - copy from `.env.example` if missing.
* Run: `./build-helpers/android.sh`
* Enter signing key's password when prompted.
* Signed `PasswordMaker.apk` is created in the project root.

### iOS

* See [this answer re build system flag](https://stackoverflow.com/a/52432058/2803757) - change in Xcode before build if necessary.
* `ionic cordova build ios --prod`
* Open `platforms/ios/Webful PasswordMaker.xcworkspace` in Xcode.
* Change target at the top to _Any iOS Device_
* _Product > Archive_
* _Distribute App_ from the Organizer dialogue.
