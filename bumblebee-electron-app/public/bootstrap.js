const Jaxcore = require('jaxcore');
const Speaker = require('speaker');

const sayPlugin = require('jaxcore-say-node');
const websocketPlugin = require('./services/websocket');
const deepspeechPlugin = require('jaxcore-deepspeech-plugin');

const windowManager = require('./window-manager');
const BumblebeeElectron = require('./bumblebee-electron');

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
	
	return jaxcore;
};

// const createBumblebeeElectron = function(jaxcore) {
// 	// return new BumblebeeElectron(jaxcore);
// };



const startBumblebeeElectron = function(callback) {
	const jaxcore = createJaxcore();
	console.log('createJaxcore');
	
	jaxcore.startServiceProfile('Bumblebee Electron',  function(err, bumblebeeElectron) {
		console.log('bumblebeeElectron');
		
		bumblebeeElectron.init(jaxcore, () => {
			const mainWindow = windowManager(jaxcore);
			
			bumblebeeElectron.setWindow(mainWindow);
			
			callback(bumblebeeElectron);
		});
	});

	// jaxcore.startService('bumblebee-electron', {}, (err, bumblebeeElectron) => {
	//
	// 	console.log('bumblebeeElectron');
	//
	// 	bumblebeeElectron.init(jaxcore, () => {
	// 		const mainWindow = windowManager(jaxcore);
	//
	// 		bumblebeeElectron.setWindow(mainWindow);
	//
	// 		callback(bumblebeeElectron);
	// 	});
	//
	// });
}

module.exports = {
	startBumblebeeElectron
};
