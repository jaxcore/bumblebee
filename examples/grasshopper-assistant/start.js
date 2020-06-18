const BumblebeeAPI = require('../../api');
const GrasshopperAssistant = require('./GrasshopperAssistant');

BumblebeeAPI.connectAssistant({
	hotword: 'grasshopper',
	name: 'Grasshopper',
	assistant: GrasshopperAssistant,
	autoStart: true
});