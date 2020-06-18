const BumblebeeAPI = require('../../api');
const PorcupineAssistant = require('./PorcupineAssistant');

BumblebeeAPI.connectAssistant({
	hotword: 'porcupine',
	name: 'Porcupine',
	assistant: PorcupineAssistant,
	autoStart: true
});