![screenshot](https://raw.githubusercontent.com/jaxcore/bumblebee/master/assets/logo.png)
# Bumblebee

### JavaScript Voice Application Platform

Write your own voice apps and assistants with an easy-to-learn JavaScript API!

![screenshot](https://raw.githubusercontent.com/jaxcore/bumblebee/master/assets/screenshot.jpg)

## About Bumblebee

Bumblebee is a set of libraries, tools, and methodologies that enables JavaScript developers
a simple way to write their own conversational voice assistants in either
NodeJS or on the web.

The core technologies that Bumblebee uses are:

- [NodeJS](https://nodejs.org/en/) - V8 JavaScript engine
- [ElectronJS](https://www.electronjs.org/) - JavaScript desktop application framework
- [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech) - Tensorflow-based speech-to-text processing
- [Picovoice Porcupine](https://github.com/Picovoice/porcupine) - JavaScript hotword detection
- [meSpeak](https://www.masswerk.at/mespeak/) - JavaScript text-to-speech library

Bumblebee builds upon these technologies by making them easier to use and tying them
together into an integrated voice application API.  Because these systems
run locally without any cloud services, stand-alone privacy-focused always-on voice applications can
finally be realized.

The Bumblebee project includes a voice app server console ([bumblebee-electron-app](bumblebee-electron-app)),
which automatically installs and sets up DeepSpeech, and runs the bumblebee websocket service that
voice applications can connect to. The applications run independently of the bumblebee server,
and use a websocket API to connect and communicate by receiving speech-to-text results
and hotword commands, or issuing text-to-speech instructions.

There are limitless ways to expand Bumblebee's capabilities by writing new applications that control
devices or services on a home network, retrieve data from the internet, and anything else you can think of.
And as you will see, they are both ***EASIER*** and ***MORE FUN*** to write than you think.

Bumblebee voice apps are small, simple, single file scripts. They can be shared easily between
systems and build upon eachother to create larger and smarter voice applications.
By associating a voice app with a hotword, your app becomes a voice assistant
that can be called upon at any time.

## Install

It's time to get started using Bumblebee to write your first voice application.

#### 1. Install NodeJS and Yarn

Although Bumblebee supplies its own version of NodeJS, to write new voice apps requires that NodeJS be installed on your system.

Install [NodeJS](https://nodejs.org/en/), v13 or higher.

Install the [Yarn](https://classic.yarnpkg.com/en/docs/install) package manager, v1.12.3 or higher.

#### 2. Clone this repository

Clone the bumblebee repo and follow these instructions:

```
git clone https://github.com/jaxcore/bumblebee
cd bumblebee/bumblebee-electron-app
yarn install
yarn run rebuild
```

#### 3. Start bumblebee

```
yarn run bumblebee-dev
```

The console as pictured above should load it up.
Make sure to turn your speakers and microphone on and follow the
instructions to install DeepSpeech.  After installation it will confirm
that speech-to-text processing is working.

If you already have
[DeepSpeech 0.7.4](https://github.com/mozilla/DeepSpeech/releases/tag/v0.7.4) installed,
you can copy or softlink
[deepspeech-0.7.4-models.pbmm](https://github.com/mozilla/DeepSpeech/releases/download/v0.7.4/deepspeech-0.7.4-models.pbmm)
and
[deepspeech-0.7.4-models.scorer](https://github.com/mozilla/DeepSpeech/releases/download/v0.7.4/deepspeech-0.7.4-models.scorer)
to the root of the `bumblebee-electron-app` directory to skip the DeepSpeech install procedure.
This can also be used to change or test different DeepSpeech models.

## Hello World

todo...