const {Client, createLogger} = require('jaxcore');
// const WebsocketTransport = require('./websocket-transport');
// const WebsocketSpin = require('./websocket-spin');
const io = require('socket.io-client');
// const log = createLogger('BumblebeeWebsocketClient');

const schema = {
	id: {
		type: 'string'
	},
	host: {
		type: 'string'
	},
	port: {
		type: 'integer'
	},
	options: {
		type: 'object'
	},
	connected: {
		type: 'boolean'
	}
};

let _instance = 0;

const clients = {};

global.BumblebeeWebsocketClients = clients;

class BumblebeeWebsocketClient extends Client {
	constructor(defaults, store) {
		super(schema, store, defaults);
		
		this.log = createLogger('BumblebeeWebsocketClient ' + (_instance++));
		this.log('create', defaults);
		this._instance = _instance;
		clients[this.state.id] = this;
	}
	
	connect() {
		let socketConfig = this.state;
		const url = socketConfig.protocol + '://' + socketConfig.host + ':' + socketConfig.port;
		this.log('connecting websocket ' + url + ' ...');
		
		const socket = io.connect(url, socketConfig.options);
		this.socket = socket;
		
		socket.once('connect', () => {
			this.log('socket connect');
			debugger;
			this.emit('connect', socket);
		});
		
		socket.once('disconnect', () => {
			this.log('socket connect');
			debugger;
			
			socket.destroy();
			
			this.emit('disconnect');
		});
		
		return socket;
	};
	
	destroy() {
		this.emit('teardown');
		if (this.socket) this.socket.destroy();
		this.removeAllListeners();
		delete this.socket;
		delete clients[this.state.id];
		// debugger;
	}
	
	static id(serviceConfig) {
		return 'bbWebsocketClient:'+serviceConfig.host+':'+serviceConfig.port;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		//log('BumblebeeWebsocketClientService getOrCreateInstance', serviceId, serviceConfig);
		
		if (serviceId in clients) {
			console.log('wsc', serviceId, 'exists');
			process.exit();
			callback(null, clients[serviceId], false);
		}
		else {
			var instance = BumblebeeWebsocketClient.create(serviceConfig, serviceStore);
			console.log('CREATED BumblebeeWebsocketClient', serviceId, serviceConfig, instance.state);
			
			callback(null, clients[serviceId], true);
			
			// instance.on('connect', function() {
			// 	// console.log('hix');
			// 	// process.exit();
			// 	if (callback) callback(null, instance, true);
			// });
			//
			// instance.connect();
			
		}
		// if (serviceInstance.clients[serviceId]) {
		// 	let instance = serviceInstance.clients[serviceId];
		// 	log('RETURNING WSC CLIENT', instance);
		// 	// process.exit();
		// 	return instance;
		// }
		// else {
		
		// }
	}
	
	
	static create(config, serviceStore) {
		var id = BumblebeeWebsocketClient.id(config);
		config.id = id;
		console.log('create wsc', id);
		let client = new BumblebeeWebsocketClient(config, serviceStore);
		
		clients[id].once('disconnect', () => {
			debugger;
			console.log('wsc disconnect');
		});
		
		return client;
	}
}

module.exports = BumblebeeWebsocketClient;