const Jaxcore = require('jaxcore');
const Speaker = require('speaker');
const sayPlugin = require('jaxcore-say-node');
const websocketPlugin = require('./services/websocket');
const BumblebeeDeepSpeech = require('bumblebee-deepspeech');
const windowManager = require('./window-manager');
const BumblebeeElectron = require('./bumblebee-electron');
const BumblebeeWebsocketPlugin = require('./services/websocket')

const BUMBLEBEE_PORT = 37688;

const createJaxcore = function(callback) {
	let jaxcore = new Jaxcore();
	
	jaxcore.addService('bumblebee-electron', BumblebeeElectron, 'service');
	
	jaxcore.defineService('Bumblebee Electron', 'bumblebee-electron', {});
	
	jaxcore.defineService('Say', 'sayNode', {});
	
	jaxcore.addPlugin(websocketPlugin);
	jaxcore.addPlugin(BumblebeeDeepSpeech);
	
	sayPlugin.speaker = Speaker;
	jaxcore.addPlugin(sayPlugin);
	
	jaxcore.addPlugin(BumblebeeWebsocketPlugin);
	
	jaxcore.defineService('Bumblebee Assistant Server', 'bbWebsocketServer', {
		host: 'localhost',
		port: BUMBLEBEE_PORT,
		allowClients: ['::1', '::ffff:127.0.0.1', '127.0.0.1'],   // only allow clients to connect from localhost or 127.0.0.1
		options: {
			allowUpgrades: true,
			transports: ['polling', 'websocket']
		}
	});
	
	return jaxcore;
};

const startBumblebeeElectron = function(callback) {
	const jaxcore = createJaxcore();
	console.log('createJaxcore');
	
	jaxcore.startServiceProfile('Bumblebee Electron',  function(err, bumblebeeElectron) {
		console.log('bumblebeeElectron');
		
		// bumblebeeElectron.init(jaxcore, (err, bumblebee) => {
		// 	if (err) {
		// 		console.log('init err: ', err);
		// 	}
		// 	else {
		// 		const mainWindow = windowManager(jaxcore);
		// 		bumblebeeElectron.setWindow(mainWindow);
		// 		callback(bumblebeeElectron);
		// 	}
		// });
		const mainWindow = windowManager(jaxcore);
		bumblebeeElectron.init(jaxcore, mainWindow);
		// bumblebeeElectron.setWindow(mainWindow);
		// callback(bumblebeeElectron);
	});
}

module.exports = {
	startBumblebeeElectron
};
