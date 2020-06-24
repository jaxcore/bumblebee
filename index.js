
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

const App = require('./lib/App');
const Assistant = require('./lib/Assistant');

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
		const jaxcore = new Jaxcore();
		jaxcore.addPlugin(BumblebeeWebSocketPlugin);
		
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
					
					async function launchApp(AppAdapterClass) {
						debugger;
					}
					
					async function launchAssistant(hotword, assistantClass, assistantOptions) {
						await bbWebsocketClient.registerAssistant(hotword, assistantClass, assistantOptions);
						
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
						launchApp,
						launchAssistant
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

const Bumblebee = {
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

function connectAssistant(hotword, assistantClass, options, callback) {
	async function _connect() {
		try {
			options = options || {};
			
			const connectOptions = {
				timeout: options.timeout
			};
			
			const assistantOptions = {
				autoStart: options.autoStart
			};
			
			const api = await Bumblebee.connect(connectOptions);
			const assistant = await api.launchAssistant(hotword, assistantClass, assistantOptions);
			if (callback) callback(assistant);
			
			api.enableReconnect = function(callback) {
				api.bumblebee.on('disconnect', function() {
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

module.exports = Bumblebee;