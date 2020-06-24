const Bumblebee = require('@jaxcore/bumblebee');
const BumblebeeAssistant = require('./BumblebeeAssistant');

Bumblebee.connectAssistant('bumblebee', BumblebeeAssistant, {
	autoStart: true,
	timeout: 3000
});