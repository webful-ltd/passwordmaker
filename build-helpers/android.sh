#!/bin/sh

# Load configs
. .env

ionic cordova build android --prod --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $ANDROID_KEYSTORE_PATH platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk webful
$ANDROID_ZIPALIGN_PATH -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk PasswordMaker.apk
