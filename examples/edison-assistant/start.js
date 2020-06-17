const BumblebeeAPI = require('../../api');
const EdisonAssistant = require('./EdisonAssistant');

BumblebeeAPI.connectAssistant({
	hotword: 'hey_edison',
	name: 'Edison',
	assistant: EdisonAssistant,
	autoStart: true
});