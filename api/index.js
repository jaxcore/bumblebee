const Jaxcore = require('jaxcore');
// const BumblebeeWebSocketPlugin = require('./websocket-client');

const BumblebeeWebSocketPlugin = {
	devices: {
		// bumblebee: {
		// 	device: require('./websocket-bumblebee-device'),
		// 	storeType: 'service'
		// }
	},
	services: {
		bbWebsocketClient: {
			service: require('./BumblebeeWebsocketClient'),
			storeType: 'client'
		}
	}
};

const App = require('./App');
const Assistant = require('./Assistant');
const BumblebeeDevice = require('./BumblebeeDevice');

function createBumblebee(options, callback) {
	
	//
	// console.log('createBumblebee', options);
	// debugger;
	//
	// options.jaxcore.startDevice('bumblebee', {
	// 	websocketId: options.bbWebsocketClient.state.id
	// }, (device) => {
	// 	debugger;
	// 	// callback(device);
	// }, {
	// 	jaxcore: options.jaxcore,
	// 	bbWebsocketClient: options.bbWebsocketClient
	// });
	
	// const bumblebee = new BumblebeeDevice({}, options.jaxcore, options.bbWebsocketClient);
	// callback(bumblebee);
		// launchAssistant,
		// launchApp,
		// recognize,
		// say
}

function connect(options) {
	if (!options) options = {};
	
	let websocketOptions = {
		protocol: options.protocol || 'http',
		host: options.host || 'localhost',
		port: options.port || 37688,
		options: {
			reconnection: true
		}
	};
	
	return new Promise(function (resolve, reject) {
		const jaxcore = new Jaxcore();
		jaxcore.addPlugin(BumblebeeWebSocketPlugin);
		
		jaxcore.addDevice('bumblebee', BumblebeeDevice, 'client');
		
		let connected = false;
		let failed = false;
		
		
		
		function connectSocket(options) {
			
			
			// this.startService('websocketClient', null, null, webSocketClientConfig, (err, websocketClient) => {
			jaxcore.startService('bbWebsocketClient', websocketOptions, (err, bbWebsocketClient) => {
				if (err) {
					reject(err);
				}
				else {
					
					async function launchApp(AppAdapterClass) {
						debugger;
					}
					
					async function launchAssistant(hotword, AssistantAdapterClass) {
						return bbWebsocketClient.registerAssistant(hotword, AssistantAdapterClass);
					}
					
					console.log('bbWebsocketClient', typeof bbWebsocketClient);
					resolve({
						jaxcore,
						bbWebsocketClient,
						launchApp,
						launchAssistant
					});
					
					// createBumblebee({
					// 	jaxcore,
					// 	websocketOptions,
					// 	bbWebsocketClient
					// }, resolve);
				}
				// this.startDevice('speech', null, function(speech) {
				//
				// 	const onRecog = (text, stats) => {
				// 		console.log('speech.emit recognize', text, stats);
				// 		speech.speechRecognize(text, stats);
				// 	};
				//
				// 	websocketClient.on('disconnect', (text, stats) => {
				// 		console.log('websocketClient speech-recognize REMOVE --------------')
				// 		websocketClient.removeListener('speech-recognize', onRecog);
				// 	});
				//
				// 	websocketClient.on('speech-recognize', onRecog);
				// });
				//
				// if (callback) callback(err, websocketClient);
			});
			
			// jaxcore.connectWebsocket(options, function (err, bbWebsocketClient) {
			// 	if (err) {
			// 		if (options.onError) {
			// 			options.onError(err);
			// 		}
			//
			// 		if (!connected && !failed) {
			// 			failed = true;
			// 			reject(err);
			// 		}
			//
			// 		if (options.onConnect) {
			// 			options.onConnect();
			// 		}
			// 	} else if (bbWebsocketClient) {
			// 		if (!connected && !failed) {
			// 			connected = true;
			//
			// 			resolve({
			// 				websocketOptions,
			// 				jaxcore,
			// 				bbWebsocketClient,
			// 				launch
			// 			});
			// 		}
			// 	}
			// });
		}
		
		jaxcore.on('service-disconnected', (type, device) => {
			if (type === 'bbWebsocketClient') {
				
				console.log('websocket service-disconnected', type, device.id);
				if (options.onDisconnect) {
					let reconnect = options.onDisconnect(device);
					if (reconnect) {
						connectSocket();
					}
				} else {
					connectSocket();
				}
			}
		});
		
		jaxcore.on('service-connected', (type, device) => {
			console.log('service-connected', type, device.id);
			if (options.onConnect) {
				options.onConnect(device);
			}
		});
		
		connectSocket(websocketOptions);
	});
}

module.exports = {
	Jaxcore,
	Adapter: Jaxcore.Adapter,
	Client: Jaxcore.Client,
	Service: Jaxcore.Service,
	Store: Jaxcore.Store,
	connect,
	App,
	Assistant
	// connectExtension?
};