![screenshot](assets/logo.png)

### JavaScript Voice Application Framework

Write your own voice apps and assistants with an easy-to-learn JavaScript API!


## About

Bumblebee is a set of libraries, tools, and methodologies that enables JavaScript developers to write their own conversational voice assistants in either NodeJS or on the web.

The open source technologies that Bumblebee uses are:

- [NodeJS](https://nodejs.org/en/) - V8 JavaScript engine
- [ElectronJS](https://www.electronjs.org/) - JavaScript desktop application framework
- [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech) - Tensorflow-based speech-to-text processing
- [Picovoice Porcupine](https://github.com/Picovoice/porcupine) - JavaScript hotword detection
- [meSpeak](https://www.masswerk.at/mespeak/) - JavaScript text-to-speech library

Bumblebee builds upon these technologies by making them easier to use and tying them
together into an integrated voice application API.  Because these systems
run locally without any cloud services, stand-alone privacy-focused always-on voice applications can
finally be realized.

The Bumblebee project includes a voice app server console ([bumblebee-electron-app](https://github.com/jaxcore/bumblebee-electron-app)),
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

## Install Bumblebee

First release coming soon:

[https://github.com/jaxcore/bumblebee/releases](https://github.com/jaxcore/bumblebee/releases)

![screenshot](assets/screenshot.png)

#### (Optional) Developer Installation

To install Bumblebee from source code, see the [source code INSTALL](https://github.com/jaxcore/bumblebee-electron-app).

## Hello World

todo...