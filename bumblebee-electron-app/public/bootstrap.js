const Jaxcore = require('jaxcore');
const Speaker = require('speaker');

const sayPlugin = require('jaxcore-say-node');
const websocketPlugin = require('./services/websocket');
const deepspeechPlugin = require('jaxcore-deepspeech-plugin');

const windowManager = require('./window-manager');
const BumblebeeElectron = require('./bumblebee-electron');

const BumblebeeWebsocketPlugin = require('./services/websocket')

// const websocketClient = require('jaxcore-websocket-plugin/websocket-client');
// jaxcore.startService('simulator-service', {}, (err, service) => {
// 	service.init(jaxcore);
// 	// global.simulatorService = service;
// });

const createJaxcore = function(callback) {
	let jaxcore = new Jaxcore();
	
	jaxcore.addService('bumblebee-electron', BumblebeeElectron, 'service');
	
	
	jaxcore.defineService('Bumblebee Electron', 'bumblebee-electron', {
	
	});
	
	jaxcore.addPlugin(websocketPlugin);
	jaxcore.addPlugin(deepspeechPlugin);
	
	sayPlugin.speaker = Speaker;
	jaxcore.addPlugin(sayPlugin);
	
	
	jaxcore.addPlugin(BumblebeeWebsocketPlugin);
	
	jaxcore.defineService('Bumblebee Assistant Server', 'bbWebsocketServer', {
		host: 'localhost',
		port: 37688,
		allowClients: ['::1', '::ffff:127.0.0.1', '127.0.0.1'],   // only allow clients to connect from localhost or 127.0.0.1
		options: {
			allowUpgrades: true,
			transports: ['polling', 'websocket']
		}
	});
	
	// jaxcore.defineAdapter('Bumblebee Assistant Adapter', {
	// 	adapterType: 'bbWebsocketServer',
	// 	serviceProfiles: ['Bumblebee Assistant Server']
	// });
	
	return jaxcore;
};

const startBumblebeeElectron = function(callback) {
	const jaxcore = createJaxcore();
	console.log('createJaxcore');
	
	jaxcore.startServiceProfile('Bumblebee Electron',  function(err, bumblebeeElectron) {
		console.log('bumblebeeElectron');
		
		bumblebeeElectron.init(jaxcore, (err, bumblebee) => {
			if (err) {
				console.log('init: ', err);
			}
			else {
				console.log('init: bumblebee started', typeof bumblebee);
			}
			
			const mainWindow = windowManager(jaxcore);
			
			bumblebeeElectron.setWindow(mainWindow);
			
			callback(bumblebeeElectron);
		});
	});
}

module.exports = {
	startBumblebeeElectron
};
