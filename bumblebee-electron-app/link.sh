#"bumblebee-hotword-node": "git+https://github.com/jaxcore/bumblebee-hotword-node#porcupine-v1.8",
#"jaxcore": "git+https://github.com/jaxcore/jaxcore#master",
#"jaxcore-deepspeech-plugin": "git+https://github.com/jaxcore/deepspeech-plugin#deepspeech-0.7.3",
#"jaxcore-say-node": "git+https://github.com/jaxcore/jaxcore-say-node#master",

npm install speaker --mpg123-backend=openal

rm -rf node_modules/jaxcore-say-node/
rm -rf node_modules/bumblebee-hotword/
rm -rf node_modules/bumblebee-hotword-node/
rm -rf node_modules/jaxcore/
rm -rf node_modules/jaxcore-deepspeech-plugin/

npm link jaxcore
npm link jaxcore-say-node
npm link bumblebee-hotword
npm link bumblebee-hotword-node
npm link jaxcore-deepspeech-plugin

