const {Client, createLogger} = require('jaxcore');
const io = require('socket.io-client');

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
	},
	name: {
		type: 'string'
	},
	activeApps: {
		type: 'object'
	},
	activeApp: {
		type: 'string'
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
			this.log('handshake:', handshake);
			socket.emit('jaxcore-handshake', handshake);
		});
		
		socket.once('jaxcore-handshake-response', (response) => {
			this.log('jaxcore-handshake-response', response);
			if (response.success) {
				if (response.bumblebee) {
					this.setState({
						remoteState: response.bumblebee
					});
					this.log('remoteState', this.state.remoteState);
				}
				this.emit('connect', socket);
			}
			else {
				this.log('jaxcore-handshake error', handshake);
			}
		});
		
		socket.once('disconnect', () => {
			this.setState({
				connected: false,
				assistantActive: false
			});
			this.log('socket disconnect');
			
			// socket.destroy();
			this.emit('disconnect');
			
			// this.destroy();
			socket.destroy();
		});
		
		socket.on('hotword', (hotword) => {
			this.log('BB hotword', hotword);
			this.emit('hotword', hotword);
		});
		socket.on('recognize', (text, stats) => {
			// this.log('BB recognize', text, stats);
			this.emit('recognize', text, stats);
		});
		socket.on('command', (text, stats) => {
			// this.log('BB recognize', text, stats);
			this.emit('command', text, stats);
		});
		
		socket.on('assistant-active', (active, id) => {
			this.log('assistant-active', active);
			const wasActive = this.state.assistantActive;
			
			this.setState({
				assistantActive: active
			});
			
			if (id) {
				socket.once('assistant-active-confirm-'+id, () => {
					this.log('confirmed', id, 'wasActive', wasActive);
					if (!wasActive) {
						this.main();
					}
					else {
						this.log('cannot run main(), already active?');
						process.exit();
					}
				});
				socket.emit('assistant-active-'+id);
			}
		});
		
		return socket;
	};
	
	console(data) {
		this.socketEmit('console', data);
	}
	
	async say(text, options) {
		return new Promise((resolve, reject) => {
			let id = Math.random().toString().substring(2);
			this.socket.on('say-end-'+id, () => {
				this.log('say-ended', id, text, options);
				resolve();
				// process.exit();
			});
			this.socketEmit('say', text, options, id);
		});
	}
	
	async main() {
		this.log('start main', this.state.hotword, this.state.assistantName);
		this.setActiveApp('main');
	}
	
	setActiveApp(appName) {
		this.log('setActiveApp', appName);
		this.setState({
			appName
		});
		this.emit('active-app', appName);
		this.socketEmit('active-app', appName);
	}
	
	socketEmit() {
		let args = Array.prototype.slice.call(arguments);
		if (this.socket) this.socket.emit.apply(this.socket, args);
	}
	
	async registerAssistant(hotword, assistantName, AssistantClass, assistantOptions) {
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
					this.log('launch adapter', AssistantClass);
					this.setState({
						hotword,
						assistantName
					});
					
					resolve();
				}
				else {
					reject();
				}
			});
			this.socket.emit('register-assistant', hotword, assistantName, assistantOptions);
		});
	}
	
	destroy() {
		if (this.socket) this.socket.destroy();
		delete this.socket;
		delete clients[this.state.id];
	}
	
	static id(serviceConfig) {
		return 'bbWebsocketClient:'+serviceConfig.host+':'+serviceConfig.port;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		if (serviceId in clients) {
			callback(null, clients[serviceId], false);
		}
		else {
			var instance = BumblebeeWebsocketClient.create(serviceConfig, serviceStore);
			callback(null, clients[serviceId], true);
		}
	}
	
	static create(config, serviceStore) {
		var id = BumblebeeWebsocketClient.id(config);
		config.id = id;
		let client = new BumblebeeWebsocketClient(config, serviceStore);
		return client;
	}
}

module.exports = BumblebeeWebsocketClient;