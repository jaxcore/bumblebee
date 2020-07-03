![screenshot](assets/logo.png)

## Developer Installation

#### 1. Install NodeJS and Yarn and dependencies

Although Bumblebee Electron App supplies its own version of NodeJS, to write new voice apps requires that NodeJS be installed on your system.

- Install [NodeJS](https://nodejs.org/en/), v12 or higher

- Install [Yarn](https://classic.yarnpkg.com/en/docs/install) package manager, v1.12.3 or higher

- for Ubuntu Linux [see here](https://gist.github.com/dsteinman/cbe926e8ac787ca0b8f84f9c4bd7f07c) for additional dependencies

#### 2. Clone this repository

Clone the bumblebee repo and follow these instructions:

```
git clone https://github.com/jaxcore/bumblebee-electron-app
cd bumblebee-electron-app
yarn install
yarn run rebuild
```

#### 3. (Optional) DeepSpeech Model

If you already have
[DeepSpeech 0.7.4](https://github.com/mozilla/DeepSpeech/releases/tag/v0.7.4) installed,
you can copy or softlink
[deepspeech-0.7.4-models.pbmm](https://github.com/mozilla/DeepSpeech/releases/download/v0.7.4/deepspeech-0.7.4-models.pbmm)
and
[deepspeech-0.7.4-models.scorer](https://github.com/mozilla/DeepSpeech/releases/download/v0.7.4/deepspeech-0.7.4-models.scorer)
to the root of the `bumblebee-electron-app` directory to skip the DeepSpeech install procedure.
This can also be used to change or test different DeepSpeech models.

#### 4. Start the bumblebee application + assistant

```
yarn run bumblebee
```

The console like this should load it up.

![screenshot](assets/screenshot.png)

#### 5. (Optional) Run without an assistant

The bumblebee application can be started without an assistant, instead of `yarn run bumblebee` use:

```
yarn run dev
```

The console without an assistant looks like this;

![screenshot](assets/dev-screenshot.png)

If you are developing an assistant you can run it now.

If you would like to run the development version of the Bumblebee Assistant,
it can be started and stopped from a separate terminal window:

```
yarn run bumblebee-assistant
```

#### 6. (Optional) Production Build

The `dist` command will produce a packaged version of Bumblebee in the `/dist` directory.

```
yarn run dist
```
