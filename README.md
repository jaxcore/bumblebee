# Bumblebee

## JavaScript Voice Application Server

Build your own voice assistant using JavaScript!

![screenshot](https://raw.githubusercontent.com/jaxcore/bumblebee/master/screenshot.jpg)

## About Bumblebee

Bumblebee is not just a voice assistant, it is a set of libraries and methodologies that allows JavaScript
developers a way to write speech recognition enabled applications in either NodeJS or for the web.

The Bumblebee project includes a voice app server console ([bumblebee-electron-app](bumblebee-electron-app)), which
automatically installs and sets up DeepSpeech, and runs the bumblebee websocket service which
voice assistants can connect to and expand the system's capabilities by adding new skills,
connecting and controlling network service, retrieve data from the internet, and
anything you can think of.

The core technologies that Bumblebee utilizes are:

- Mozilla DeepSpeech (Tensorflow speech-to-text processing)
- meSpeak and SamJS (stand-alone JavaScript speech synthesize libraries)
- Picovoice Porcupine (JavaScript/WASM hotword detection)

Bumblebee builds upon these libraries by making them easier to use and tying them
together into an integrated voice application API.  The component libraries are:

- Bumblebee STT (DeepSpeech) - formerly called jaxcore-deepspeech-plugin
- Bumblebee TTS (meSpeak and SamJS) - formerly called jaxcore-say
- Bumblebee Hotword (Porcupine) - formerly called bumblebee-hotword-node

Because each of these libraries runs independently without any cloud services,
stand-alone privacy-focused always-on voice applications can finally be realized.
And as you will see, they are a lot *EASIER* and *MORE FUN* to write than you think.

## Install

It's time to get started.

Clone this repository and follow these instructions:

```
git clone https://github.com/jaxcore/bumblebee
cd bumblebee/bumblebee-electron-app
npm install
npm run rebuild
```

If you already have DeepSpeech 0.7.3 installed, you can copy or softlink the files to the root of the `bumblebee-electron-app` directory to skip the DeepSpeech install step beloow.  This can also be used to change or test different DeepSpeech models.

## Run the bumblebee assistant

```
npm run bumblebee-assistant
```

The console as pictured above should load it up.
Make sure to turn on your speakers and microphone on and follow the
instructions to install DeepSpeech.  After installation it will confirm
that speech-to-text processing is working.


## Hello World

todo...