const Bumblebee = require('jaxcore-bumblebee');
const BumblebeeAssistant = require('./BumblebeeAssistant');

Bumblebee.connectAssistant(BumblebeeAssistant, {
	hotword: 'bumblebee',
	autoStart: true,
	timeout: 3000
});