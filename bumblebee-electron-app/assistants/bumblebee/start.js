const BumblebeeAPI = require('../../../api');
const BumblebeeAssistant = require('./BumblebeAssistant');

BumblebeeAPI.connectAssistant({
	hotword: 'bumblebee',
	name: 'Bumblebee',
	assistant: BumblebeeAssistant,
	autoStart: true
});