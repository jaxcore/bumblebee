const {Client, createLogger} = require('jaxcore');
const io = require('socket.io-client');

const JAXCORE_VERSION = '0.0.3';
const BUMBLEBEE_PROTOCOL = 1;

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
			this.log('socket connected');
			const handshake = {
				jaxcore: {
					version: JAXCORE_VERSION,
					protocol: {
						bumblebee: BUMBLEBEE_PROTOCOL
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
			this.emit('disconnect');
			socket.destroy();
		});
		
		socket.on('hotword', (hotword) => {
			this.log('BB hotword', hotword);
			this.emit('hotword', hotword);
		});
		socket.on('recognize', (text, stats) => {
			// this.log('BB recognize', text, stats);
			this.emit('recognize', {text, stats});
		});
		socket.on('command', (text, stats) => {
			this.log('BB command', text, stats);
			this.emit('command', {text, stats});
		});
		
		socket.on('system-message', (message) => {
			this.emit('system-message', message);
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
						this.setState({
							appName: 'main'
						});
						this.socketEmit('active-app', 'main');
						
						this.startAssistant();
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
			});
			this.socketEmit('say', text, options, id);
		});
	}
	
	async startAssistant() {
		this.log('startAssistant', this.state.hotword, this.state.assistantName);
		this.emit('start');
	}
	
	socketEmit() {
		let args = Array.prototype.slice.call(arguments);
		if (this.socket) this.socket.emit.apply(this.socket, args);
	}
	
	async recognize(options) {
		if (!options) options = {};
		return new Promise((resolve, reject) => {
			let timedOut = false;
			let timer;
			
			const onTimedRecognize = function (recognition) {
				clearTimeout(timer);
				this.removeListener('abort-recognize', abortHandler);
				if (!timedOut) resolve(recognition);
			}
			
			const onRecognized = function (recognition) {
				this.removeListener('abort-recognize', abortHandler);
				resolve(recognition);
			};
			
			const abortHandler = (reason) => {
				if (options.timeout) {
					this.removeListener('recognize', onTimedRecognize);
				}
				else {
					this.removeListener('recognize', onRecognized);
				}
				clearTimeout(timer);
				reject({
					aborted: reason
				});
			};
			
			this.once('abort-recognize', abortHandler);
			
			if (options.timeout) {
				timer = setTimeout(function () {
					timedOut = true;
					this.removeListener('abort-recognize', abortHandler);
					reject({
						error: {
							timedOut: true
						}
					});
				}, options.timeout);
				
				this.once('recognize', onTimedRecognize);
			}
			else {
				this.once('recognize', onRecognized);
			}
		});
	}
	
	async registerAssistant(hotword, AssistantClass, assistantOptions) {
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
						hotword
					});
					
					resolve();
				}
				else {
					reject();
				}
			});
			this.socket.emit('register-assistant', hotword, assistantOptions);
		});
	}
	
	async delay(t, v) {
		return new Promise(function(resolve) {
			setTimeout(resolve.bind(null, v), t)
		});
	}
	
	returnError(e) {
		console.log('emit assistant-return-error', e);
		this.socketEmit('assistant-return-error', e.message);
	}
	returnValue(r) {
		console.log('emit assistant-return-value', r);
		this.socketEmit('assistant-return-value', r);
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
			const client = BumblebeeWebsocketClient.create(serviceConfig, serviceStore);
			clients[client.state.id] = client;
			callback(null, clients[serviceId], true);
		}
	}
	
	static create(config, serviceStore) {
		const id = BumblebeeWebsocketClient.id(config);
		config.id = id;
		return new BumblebeeWebsocketClient(config, serviceStore);
	}
}

module.exports = BumblebeeWebsocketClient;