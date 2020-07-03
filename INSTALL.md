![screenshot](assets/logo.png)

## Developer Installation

#### 1. Install NodeJS and dependencies

Although Bumblebee Electron App supplies its own version of NodeJS, to write new voice apps requires that NodeJS be installed on your system.

- Install [NodeJS](https://nodejs.org/en/), v12 or higher

- for Ubuntu Linux there are additional dependencies:

```
sudo apt install build-essentials libasound2-dev git gcc-multilib libstdc++6
```

#### 2. Clone this repository

Clone the bumblebee repo and follow these instructions:

```
git clone https://github.com/jaxcore/bumblebee-electron-app
cd bumblebee-electron-app
npm install
npm run rebuild
```

#### 3. (Optional) DeepSpeech Model

The first time Bumblebee is run, it will prompt to download the DeepSpeech english language models.

If you already have
[DeepSpeech 0.7.4](https://github.com/mozilla/DeepSpeech/releases/tag/v0.7.4) installed,
you can skip the download step by copying or softlinking
[deepspeech-0.7.4-models.pbmm](https://github.com/mozilla/DeepSpeech/releases/download/v0.7.4/deepspeech-0.7.4-models.pbmm)
and
[deepspeech-0.7.4-models.scorer](https://github.com/mozilla/DeepSpeech/releases/download/v0.7.4/deepspeech-0.7.4-models.scorer)
to the root of the `bumblebee-electron-app` directory.
This can also be used to change or test different DeepSpeech models, including different languages.

If the auto-downloaded models are already installed, they can be found at:

- MacOSX: `~/Library/Application\ Support/com.jaxcore.bumblebee`
- Linux:  `~/.config/com.jaxcore.bumblebee`
- Windows: `?`

Bumblebee first looks here for the models, delete them if yoou would like to try a different model.

#### 4. Start the bumblebee application + assistant

```
npm run bumblebee
```

The console like this should load it up.

![screenshot](assets/screenshot.png)

#### 5. (Optional) Run without an assistant

The bumblebee application can be started without an assistant, instead of `yarn run bumblebee` use:

```
npm run dev
```

The console without an assistant looks like this;

![screenshot](assets/dev-screenshot.png)

If you are developing an assistant you can run it now.

If you would like to run the development version of the Bumblebee Assistant,
it can be started and stopped from a separate terminal window:

```
npm run bumblebee-assistant
```

#### 6. (Optional) Production Build

The `dist` command will produce a packaged version of Bumblebee in the `/dist` directory.

```
npm run dist
```
