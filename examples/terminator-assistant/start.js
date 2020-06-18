const BumblebeeAPI = require('../../api');
const TerminatorAssistant = require('./TerminatorAssistant');

BumblebeeAPI.connectAssistant({
	hotword: 'terminator',
	name: 'Terminator',
	assistant: TerminatorAssistant,
	autoStart: true
});