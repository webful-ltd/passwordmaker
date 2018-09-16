# Webful PasswordMaker

[![Build Status](https://travis-ci.com/webful-ltd/passwordmaker.svg?branch=master)](https://travis-ci.com/webful-ltd/passwordmaker)

![Icon](./resources/android/icon/drawable-xhdpi-icon.png)

A modern mobile app supporting [Password Maker](https://passwordmaker.org/).

Built with [Ionic](https://ionicframework.com/) and [Angular](https://angular.io/).

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

## Icon & splash screen

These use [Ionicons](https://ionicons.com/)' iOS-style key SVG (MIT licensed).
