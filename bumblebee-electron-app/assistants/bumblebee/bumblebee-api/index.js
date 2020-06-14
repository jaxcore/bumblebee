const Jaxcore = require('jaxcore');
const BumblebeeWebSocketPlugin = require('./websocket-client');

function connect(options) {
	debugger;
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
		debugger;
		jaxcore.addPlugin(BumblebeeWebSocketPlugin);
		
		let connected = false;
		let failed = false;
		
		function launch(customSpinAdapterClass, onAdapterCreated, onAdapterDestroyed) {
			debugger;
			
			// jaxcore.addAdapter('custom-spin-adapter', customSpinAdapterClass);
			//
			// jaxcore.defineAdapter('CustomSpinAdapterClass', {
			// 	adapterType: 'custom-spin-adapter',
			// 	deviceType: 'spin'
			// });
			//
			// jaxcore.on('device-connected', function (type, device) {
			// 	if (type === 'bumblebee') {
			//
			// 	}
			// 	debugger;
			//
			// 	// if (type === 'websocketSpin') {
			// 	// 	const spin = device;
			// 	//
			// 	// 	console.log('connected', spin);
			// 	//
			// 	// 	jaxcore.connectAdapter(spin, 'CustomSpinAdapterClass', function (err, adapter) {
			// 	// 		if (err) {
			// 	// 			console.log('adapter error', e);
			// 	// 		} else {
			// 	// 			console.log('adapter created', adapter);
			// 	// 			if (onAdapterCreated) onAdapterCreated(adapter);
			// 	// 		}
			// 	// 	});
			// 	// } else {
			// 	// 	//console.log('device-connected', type);
			// 	// }
			// });
		}
		
		function connectSocket(options) {
			
			// this.startService('websocketClient', null, null, webSocketClientConfig, (err, websocketClient) => {
			jaxcore.startService('bbWebsocketClient', websocketOptions, (err, bbWebsocketClient) => {
				console.log('bbWebsocketClient', typeof bbWebsocketClient);
				debugger;
				
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
	Jaxcore: Jaxcore,
	Adapter: Jaxcore.Adapter,
	Client: Jaxcore.Client,
	Service: Jaxcore.Service,
	Store: Jaxcore.Store,
	connect
	// connectExtension?
};