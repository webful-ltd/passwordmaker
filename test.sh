#/bin/sh
sudo apt-get update
sudo apt-get -qq -y install xvfb
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get install -y ./google-chrome-stable_current_amd64.deb
npm install --quiet
xvfb-run npm run ci
