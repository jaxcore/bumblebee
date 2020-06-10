# Bumblebee Voice Assistant (electron app)

## Install

At the root of this app directory, perform the following:

```
npm install
npm run rebuild
```

On MacOSX install the alternate `speaker` backend:

```
npm install speaker --mpg123-backend=openal
```

## Download DeepSpeech 0.7.3 Models

```
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/deepspeech-0.7.3-models.pbmm
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/deepspeech-0.7.3-models.scorer
```

## Run development build

```
npm run dev
```

If you experience node version compilation problems try the following:

```
npm cache clean
npm run rebuild
```

And then try `npm run dev` again.