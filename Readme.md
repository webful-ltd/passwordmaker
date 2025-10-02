# [Webful PasswordMaker](https://passwordmaker.webful.uk)

![Icon](./resources/android/icon/drawable-xhdpi-icon.png)

[![Build Status](https://circleci.com/gh/webful-ltd/passwordmaker.svg?style=svg)](https://app.circleci.com/pipelines/github/webful-ltd/passwordmaker)

A modern mobile app supporting [Password Maker](https://passwordmaker.org/).

Make secure, unique-per-site passwords.

Built with [Ionic](https://ionicframework.com/) and [Angular](https://angular.io/).

## What's this?

This Android & iOS app makes you a unique password for each site you use, following a
deterministic algorithm which means no central trusted server, and compatibility with
several other plugins and apps which have followed the same conventions over the years.

See [the hype page](https://passwordmaker.webful.uk) for more about
what the app does, why you might want it and how to pick your [settings](https://passwordmaker.webful.uk/#settings).

## Thanks & licences

Many thanks to other PasswordMaker projects which have provided inspiration and code
for this one. Notably:
* An old library `emersion/node-passwordmarker` underpins the [forked library](https://github.com/webful-ltd/passwordmaker-lib)
doing a lot of the work (which has it own MIT licence in that repo).
* [`chrome-passwordmaker`](https://github.com/passwordmaker/chrome-passwordmaker/tree/master) formed much of
  the basis for the import/export code, which [is LGPL-3.0 licensed](./licenses/LGPL-3.0.md) in line with that extension.
* All other codes in this repo [is GPL-3.0 licenseed](./LICENSE).

## Get the app

### Stable releases

For the stable version, see [the download section](https://passwordmaker.webful.uk/#download) and find your platform.

### Beta releases

To use beta releases – which normally come out with hopefully-stable changes from
this codebase a few days after they are deemed complete, [opt in via the Beta links](https://passwordmaker.webful.uk/#beta).

### Bleeding edge

If you'd like to help test changes earlier in the development cycle, please use this
repository and [Ionic CLI](https://github.com/ionic-team/ionic-cli) to run the app locally.

## Dev info

See [the Development doc](doc/Development.md) for local dev & build details.

## Icon & splash screen

These use [Ionicons](https://ionicons.com/)' iOS-style key SVG (MIT licensed).
