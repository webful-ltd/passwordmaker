#!/bin/sh

# Load configs
. .env

ionic cordova build android --prod --release
apksigner sign --ks $ANDROID_KEYSTORE_PATH --v1-signer-name webful --out PasswordMaker.apk platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
