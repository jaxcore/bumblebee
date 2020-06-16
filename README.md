# Bumblebee

## JavaScript Voice Application Server

Build your own voice assistant using JavaScript!

![screenshot](https://raw.githubusercontent.com/jaxcore/bumblebee/master/screenshot.jpg)

## About

Bumblebee is not just a voice assistant, it is a set of libraries and methodologies that allows JavaScript
developers a way to write speech recognition enabled applications in either NodeJS or for the web.

The speech technologies used are:

- Mozilla DeepSpeech (speech-to-text)

- meSpeak and SamJS (text-to-speech)

- Picovoice Porcupine (hotword detection)

The Bumblebee project includes a voice app server console ([bumblebee-electron-app](bumblebee-electron-app)), which
automatically installs and sets up DeepSpeech, and runs a websocket service.

## Install

To get started, clone this repository and follow these instructions:

```
git clone https://github.com/jaxcore/bumblebee
cd bumblebee/bumblebee-electron-app
npm install
npm run rebuild
```

## Run the bumblebee assistant

```
npm run bumblebee-assistant
```

The console as pictured above should load it up.  Make sure to turn your speakers on and follow the voice instructions to install DeepSpeech.

