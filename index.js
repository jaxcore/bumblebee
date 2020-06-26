
const Jaxcore = require('jaxcore');
const BumblebeeWebsocketClient = require('./lib/BumblebeeWebsocketClient');
const BumblebeeWebSocketPlugin = {
	services: {
		bumblebee: {
			service: BumblebeeWebsocketClient,
			storeType: 'client'
		}
	}
};

const Application = require('./lib/Application');
const Assistant = require('./lib/Assistant');

let _jaxcore;
function createJaxcore() {
	if (!_jaxcore) {
		_jaxcore = new Jaxcore();
		_jaxcore.addPlugin(BumblebeeWebSocketPlugin);
	}
	return _jaxcore;
}

function connect(options) {
	
	if (!options) options = {};
	
	let websocketOptions = {
		protocol: options.protocol || 'http',
		host: options.host || 'localhost',
		port: options.port || 37688,
		options: {
			reconnection: false
		},
		serviceTimeout: options.timeout || 10000
	};
	
	return new Promise(function (resolve, reject) {
		const jaxcore = createJaxcore()
		
		function connectSocket(options) {
			let wOptions = {
				...websocketOptions
			}
			if (options) {
				if (options.host) wOptions.host = options.host;
				if (options.port) wOptions.port = options.port;
			}
			
			console.log('connecting:', wOptions);
			
			let serviceProfileName = 'websocket:'+websocketOptions.host+':'+websocketOptions.port;
			
			jaxcore.defineService(serviceProfileName, 'bumblebee', wOptions);
			
			let didConnect = false;
			jaxcore.startServiceProfile(serviceProfileName,(err, bbWebsocketClient) => {
				if (err) {
					reject(err);
				}
				else {
					didConnect = true;
					
					bbWebsocketClient.init(jaxcore);
					
					async function launchApplication(applicationClass, applicationOptions) {
						const success = await bbWebsocketClient.registerApplication(applicationClass, applicationOptions);
						if (success) {
							let adapterProfileName = 'bbassistant:' + websocketOptions.host + ':' + websocketOptions.port;
							console.log('connecting ADAPTER', adapterProfileName);
							console.log('connecting ADAPTER', adapterProfileName);
							console.log('connecting ADAPTER', adapterProfileName);
							console.log('connecting ADAPTER', adapterProfileName);
							console.log('connecting ADAPTER', adapterProfileName);
							console.log('connecting ADAPTER', adapterProfileName);
							console.log('connecting ADAPTER', adapterProfileName);
							console.log('connecting ADAPTER', adapterProfileName);
						}
					}
					
					async function launchAssistant(assistantClass, assistantOptions) {
						await bbWebsocketClient.registerAssistant(assistantClass, assistantOptions);
						
						let adapterProfileName = 'bbassistant:'+websocketOptions.host+':'+websocketOptions.port;
						
						jaxcore.addAdapter(adapterProfileName, assistantClass);
						jaxcore.defineAdapter(adapterProfileName, {
							adapterType: adapterProfileName,
							websocketOptions,
							serviceProfiles: [serviceProfileName]
						});
						
						jaxcore.connectAdapter(null, adapterProfileName, function(err, adapter) {
						
						});
					}
					
					if (options.enableReconnect) {
						bbWebsocketClient.on('disconnect', function() {
							console.log('reconnecting...');
							options.enableReconnect();
						})
					}
					
					console.log('bbWebsocketClient', typeof bbWebsocketClient);
					const api = {
						jaxcore,
						bumblebee: bbWebsocketClient,
						launchAssistant,
						launchApplication
					};
					resolve(api);
				}
			});
		}
		
		jaxcore.on('service-disconnected', (type, device) => {
			console.log('service-disconnected', type, device);
			if (type === 'bumblebee') {
				console.log('websocket service-disconnected', type, device.id);
				console.log('reconnecting', device.id, '...');
				process.exit();
			}
		});
		
		connectSocket(websocketOptions);
	});
}


async function connectAssistant(assistantClass, assistantOptions) {
	try {
		const api = await Bumblebee.connect({
			timeout: assistantOptions.timeout
		});
		console.log('API', api);
		console.log('------------------------');
		console.log('------------------------');
		const assistant = await api.launchAssistant(assistantClass, assistantOptions);
		return assistant;
	}
	catch(e) {
		console.error('error:', e);
		console.log('error reconnecting...');
	}
}
// function connectAssistant(assistantClass, assistantOptions, callback) {
// 	async function _connect() {
// 		try {
// 			const api = await Bumblebee.connect({
// 				timeout: assistantOptions.timeout
// 			});
// 			const assistant = await api.launchAssistant(assistantClass, assistantOptions);
// 			if (callback) callback(assistant);
//
// 			api.enableReconnect = function(callback) {
// 				api.bumblebee.on('disconnect', function() {
// 					console.log('reconnecting...');
// 					callback();
// 				})
// 			}
// 			api.enableReconnect(_connect);
// 		}
// 		catch(e) {
// 			console.error('error:', e);
// 			console.log('error reconnecting...');
// 			_connect();
// 		}
// 	}
// 	_connect();
// }

async function connectApplication(applicationClass, applicationOptions) {
	try {
		const api = await Bumblebee.connect({
			timeout: applicationOptions.timeout
		});
		const assistant = await api.launchApplication(applicationClass, applicationOptions);
		return assistant;
	}
	catch(e) {
		console.error('error:', e);
		process.exit();
	}
}

const Bumblebee = {
	Jaxcore,
	// Adapter: Jaxcore.Adapter,
	// Client: Jaxcore.Client,
	// Service: Jaxcore.Service,
	// Store: Jaxcore.Store,
	connect,
	connectApplication,
	connectAssistant,
	Application,
	Assistant
};

module.exports = Bumblebee;