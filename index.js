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

function connectAdapter(adapterProfileName) {
	return new Promise(function (resolve, reject) {
		_jaxcore.connectAdapter(null, adapterProfileName, function (err, adapter) {
			if (err) reject(err);
			else resolve(adapter);
		});
	});
}

async function launchApplication(api, applicationClass, applicationOptions) {
	const {jaxcore, bumblebee, websocketOptions, serviceProfileName} = api;
	
	const success = await bumblebee.registerApplication(applicationClass, applicationOptions);
	if (success) {
		let adapterProfileName = 'bbassistant:' + websocketOptions.host + ':' + websocketOptions.port;
		console.log('connecting ADAPTER', adapterProfileName);
		
		jaxcore.addAdapter(adapterProfileName, applicationClass);
		console.log('applicationOptions.initialState', applicationOptions.initialState)
		
		jaxcore.defineAdapter(adapterProfileName, {
			adapterType: adapterProfileName,
			websocketOptions,
			serviceProfiles: [serviceProfileName],
			initialState: applicationOptions.initialState
		});
		
		return connectAdapter(adapterProfileName);
	}
}

async function launchAssistant(api, assistantClass, assistantOptions) {
	const {jaxcore, bumblebee, websocketOptions, serviceProfileName} = api;
	await bumblebee.registerAssistant(assistantClass, assistantOptions);
	let adapterProfileName = 'bbassistant:' + websocketOptions.host + ':' + websocketOptions.port;
	jaxcore.addAdapter(adapterProfileName, assistantClass);
	jaxcore.defineAdapter(adapterProfileName, {
		adapterType: adapterProfileName,
		websocketOptions,
		serviceProfiles: [serviceProfileName]
	});
	return connectAdapter(adapterProfileName);
}

function connect(options) {
	return new Promise(function (resolve, reject) {
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
		
		const jaxcore = createJaxcore()
		
		let serviceProfileName = 'websocket:' + websocketOptions.host + ':' + websocketOptions.port;
		
		jaxcore.defineService(serviceProfileName, 'bumblebee', websocketOptions);
		
		let didConnect = false;
		jaxcore.startServiceProfile(serviceProfileName, (err, bbWebsocketClient) => {
			if (err) {
				reject(err);
			}
			else {
				didConnect = true;
				
				bbWebsocketClient.init(jaxcore);
				
				if (options.enableReconnect) {
					bbWebsocketClient.on('disconnect', function () {
						console.log('reconnecting...');
						options.enableReconnect();
					})
				}
				
				console.log('bbWebsocketClient', typeof bbWebsocketClient);
				const api = {
					jaxcore,
					bumblebee: bbWebsocketClient,
					websocketOptions,
					serviceProfileName,
					// launchAssistant
					// launchApplication
				};
				
				jaxcore.on('service-disconnected', (type, device) => {
					console.log('service-disconnected', type, device);
					if (type === 'bumblebee') {
						console.log('websocket service-disconnected', type, device.id);
						console.log('reconnecting', device.id, '...');
						process.exit();
					}
				});
				
				resolve(api);
			}
		});
	});
}

async function connectAssistant(assistantClass, assistantOptions) {
	try {
		const api = await Bumblebee.connect({
			timeout: assistantOptions.timeout
		});
		return Bumblebee.launchAssistant(api, assistantClass, assistantOptions);
	} catch (e) {
		console.error('connectAssistant error:', e);
		process.exit();
	}
}

async function connectApplication(applicationClass, applicationOptions) {
	try {
		const api = await Bumblebee.connect({
			timeout: applicationOptions.timeout
		});
		return Bumblebee.launchApplication(api, applicationClass, applicationOptions);
	} catch (e) {
		console.error('connectApplication error:', e);
		process.exit();
	}
}

const Bumblebee = {
	connect,
	connectApplication,
	launchApplication,
	connectAssistant,
	launchAssistant,
	Application,
	Assistant
};

module.exports = Bumblebee;