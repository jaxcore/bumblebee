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
	
	init(jaxcore) {
		this.jaxcore = jaxcore;
	}
	
	connect() {
		let socketConfig = this.state;
		const url = socketConfig.protocol + '://' + socketConfig.host + ':' + socketConfig.port;
		this.log('connecting websocket ' + url + ' ...');
		
		const socket = io.connect(url, socketConfig.options);
		this.socket = socket;
		
		socket.once('connect', () => {
			this.setState({connected: true});
			this.log('socket connect');
			const handshake = {
				jaxcore: {
					version: '0.0.2',
					protocol: {
						bumblebee: 1
					}
				}
			};
			console.log('handshake:', handshake);
			socket.emit('jaxcore-handshake', handshake);
		});
		
		socket.once('jaxcore-handshake-response', (response) => {
			console.log('jaxcore-handshake-response', response);
			if (response.success) {
				if (response.bumblebee) {
					this.setState({
						remoteState: response.bumblebee
					});
					console.log('remoteState', this.state.remoteState);
				}
				this.emit('connect', socket);
			}
			else {
				console.log('jaxcore-handshake error', handshake);
				// process.exit();
			}
		});
		
		socket.once('disconnect', () => {
			this.setState({
				connected: false,
				assistantActive: false
			});
			this.log('socket disconnect');
			debugger;
			// socket.destroy();
			this.emit('disconnect');
			
			// this.destroy();
			socket.destroy();
		});
		
		socket.on('recognize', (text, stats) => {
			console.log('BB recognize', text, stats);
		});
		
		socket.on('assistant-active', (active) => {
			console.log('assistant-active', active);
			debugger;
			this.setState({assistantActive: true});
		});
		
		return socket;
	};
	
	async registerAssistant(hotword, AssistantClass, wOptions) {
		return new Promise((resolve, reject) => {
			if (!this.socket) {
				reject(new Error('no socket'));
				return;
			}
			if (!this.state.connected) {
				reject(new Error('not connected'));
				return;
			}
			this.socket.once('register-assistant-response', (response) => {
				if (response[hotword] && response[hotword].success) {
					console.log('launch adapter', AssistantClass);
					
					resolve();
					// s//
				}
				else {
					debugger;
					reject();
				}
			});
			this.socket.emit('register-assistant', hotword);
		});
	}
	
	destroy() {
		// this.emit('teardown');
		if (this.socket) this.socket.destroy();
		
		// this.removeAllListeners();
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
			// process.exit();
			callback(null, clients[serviceId], false);
		}
		else {
			var instance = BumblebeeWebsocketClient.create(serviceConfig, serviceStore);
			console.log('CREATED BumblebeeWebsocketClient', serviceId, serviceConfig, instance.state);
			callback(null, clients[serviceId], true);
		}
	}
	
	
	static create(config, serviceStore) {
		var id = BumblebeeWebsocketClient.id(config);
		config.id = id;
		let client = new BumblebeeWebsocketClient(config, serviceStore);
		// clients[id].once('disconnect', () => {
		// 	debugger;
		// 	console.log('wsc disconnect');
		// });
		return client;
	}
}

module.exports = BumblebeeWebsocketClient;