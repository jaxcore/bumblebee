
![screenshot](logo.png) 
# Bumblebee

## JavaScript Voice Application Server

Write your own voice assistant using JavaScript!

![screenshot](https://raw.githubusercontent.com/jaxcore/bumblebee/master/screenshot.jpg)


## About Bumblebee

Bumblebee is not just a voice assistant, it is a set of libraries and methodologies that enables JavaScript
developers a new way to write speech recognition enabled applications in either NodeJS or for the web.

The core technologies that Bumblebee utilizes are:

- [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech) - Tensorflow/JavaScript speech-to-text processing
- [meSpeak](https://www.masswerk.at/mespeak/) - JavaScript text-to-speech library
- [Picovoice Porcupine](https://github.com/Picovoice/porcupine) - JavaScript wake word (hotword) detection

Bumblebee builds upon these by making them easier to use and tying them
together into an integrated voice application API.  Because these systems
run locally without any cloud services, stand-alone privacy-focused always-on voice applications can finally be realized.  And as you will see, they are both ***EASIER*** and ***MORE FUN*** to write than you think.


The Bumblebee project includes a voice app server console ([bumblebee-electron-app](bumblebee-electron-app)), which
automatically installs and sets up DeepSpeech, and runs the bumblebee websocket service that
voice assistants can connect to.

The voice assistants and the applications run independently of the bumblebee server, and use a websocket client API to connect, and add new assistants or applications.  There are limitless ways to expand Bumblebee's capabilities by write applications that control devices or services on a home network, retrieve data from the internet, and anything else you can think of.

## Install

It's time to get started.

#### 1. Install NodeJS

Although the Bumblebee app is an Electron App which supplies its own version of NodeJS, to write new voice apps requires that NodeJS be installed on your system.

Download and install [NodeJS](https://nodejs.org/en/) (v13 or higher).

#### 2. Clone this repository

Clone the bumblebee repo and follow these instructions:

```
git clone https://github.com/jaxcore/bumblebee
cd bumblebee/bumblebee-electron-app
npm install
npm run rebuild
```

#### 3. Run the bumblebee assistant

```
npm run bumblebee-assistant
```

The console as pictured above should load it up.
Make sure to turn on your speakers and microphone on and follow the
instructions to install DeepSpeech.  After installation it will confirm
that speech-to-text processing is working.

If you already have [DeepSpeech 0.7.3](https://github.com/mozilla/DeepSpeech/releases/tag/v0.7.3) installed, you can copy or softlink [deepspeech-0.7.3-models.pbmm](https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/deepspeech-0.7.3-models.pbmm) and [deepspeech-0.7.3-models.scorer](https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/deepspeech-0.7.3-models.scorer) to the root of the `bumblebee-electron-app` directory to skip the DeepSpeech install procedure.  This can also be used to change or test different DeepSpeech models.


## Hello World

todo...