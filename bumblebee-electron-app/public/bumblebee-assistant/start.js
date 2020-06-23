const BumblebeeAPI = require('bumblebee-api');
const BumblebeeAssistant = require('./BumblebeeAssistant');

BumblebeeAPI.connectAssistant('bumblebee', BumblebeeAssistant, {
	autoStart: true,
	timeout: 3000
});