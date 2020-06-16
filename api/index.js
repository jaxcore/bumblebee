const Jaxcore = require('jaxcore');
const BumblebeeWebSocketPlugin = {
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

function connect(options) {
	if (!options) options = {};
	
	let websocketOptions = {
		protocol: options.protocol || 'http',
		host: options.host || 'localhost',
		port: options.port || 37688,
		options: {
			reconnection: false
		},
		serviceTimeout: 10000
	};
	
	return new Promise(function (resolve, reject) {
		const jaxcore = new Jaxcore();
		jaxcore.addPlugin(BumblebeeWebSocketPlugin);
		jaxcore.addDevice('bumblebee', BumblebeeDevice, 'client');
		
		function connectSocket(options) {
			let wOptions = {
				...websocketOptions
			}
			if (options) {
				if (options.host) wOptions.host = options.host;
				if (options.port) wOptions.port = options.port;
			}
			
			let serviceProfileName = 'websocket:'+websocketOptions.host+':'+websocketOptions.port;
			
			jaxcore.defineService(serviceProfileName, 'bbWebsocketClient', wOptions);
			// debugger;
			
			let didConnect = false;
			jaxcore.startServiceProfile(serviceProfileName,(err, bbWebsocketClient) => {
				if (err) {
					reject(err);
				}
				else {
					didConnect = true;
					
					// bbWebsocketClient.on('disconnect', function() {
					// 	console.log('disconnected', bbWebsocketClient.id);
					// 	// process.exit();
					// })
					
					// debugger;
					bbWebsocketClient.init(jaxcore);
					
					async function launchApp(AppAdapterClass) {
						debugger;
					}
					
					async function launchAssistant(options) {
						const {hotword, name, assistant, autoStart} = options;
						const AssistantAdapterClass = assistant;

						const assistantOptions = {
							autoStart
						};
						await bbWebsocketClient.registerAssistant(hotword, name, assistant, assistantOptions);
						
						let adapterProfileName = 'bbassistant:'+websocketOptions.host+':'+websocketOptions.port;
						
						jaxcore.addAdapter(adapterProfileName, AssistantAdapterClass);
						jaxcore.defineAdapter(adapterProfileName, {
							adapterType: adapterProfileName,
							websocketOptions,
							serviceProfiles: [serviceProfileName]
						});
						
						debugger;
						jaxcore.connectAdapter(null, adapterProfileName, function(err, adapter) {
							debugger;
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
						bbWebsocketClient,
						launchApp,
						launchAssistant
					};
					global.api = api;
					global.jaxcore = api.jaxcore;
					resolve(api);
				}
			});
		}
		
		jaxcore.on('service-disconnected', (type, device) => {
			console.log('service-disconnected', type, device);
			if (type === 'bbWebsocketClient') {
				console.log('websocket service-disconnected', type, device.id);
				console.log('reconnecting', device.id, '...');
				process.exit();
			}
		});
		
		connectSocket(websocketOptions);
	});
}

const BumblebeeAPI = {
	Jaxcore,
	Adapter: Jaxcore.Adapter,
	Client: Jaxcore.Client,
	Service: Jaxcore.Service,
	Store: Jaxcore.Store,
	connect,
	connectAssistant,
	App,
	Assistant
};

function connectAssistant(options) {
	// {
	// 	hotword: 'bumblebee',
	// 		name: 'Bumblebee',
	// 	assistant: BumblebeeAssistant,
	// 	autoStart: true
	// }
	// const {hotword, name, assistant, autoStart} = options;
	
	// console.log('options', options);

	// return;
	// const assistantOptions = {
	// 	autoStart
	// };
	
	async function _connect() {
		try {
			const api = await BumblebeeAPI.connect({
				// enableReconnect: connect
			});
			const assistant = await api.launchAssistant(options);
			console.log('assistant', assistant);
			
			api.enableReconnect = function(callback) {
				api.bbWebsocketClient.on('disconnect', function() {
					console.log('reconnecting...');
					callback();
				})
			}
			api.enableReconnect(_connect);
			
		}
		catch(e) {
			console.error('error:', e);
			console.log('error reconnecting...');
			_connect();
		}
	}
	_connect();
}


module.exports = BumblebeeAPI;