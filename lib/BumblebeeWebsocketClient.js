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
		type: 'object'
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
		
		socket.on('recognize', (text, stats) => {
			// this.log('BB recognize', text, stats);
			this.emit('recognize', {text, stats});
		});
		
		socket.on('system-message', (message) => {
			this.emit('system-message', message);
		});
		
		socket.on('run-application-request', (assistant, runId, args, options) => {
			this.log('run-application-request', assistant, runId, args, options);
			this.startApplication(assistant, runId, args, options);
		});
		
		// assistant
		socket.on('hotword', (hotword) => {
			this.log('BB hotword', hotword);
			this.emit('hotword', hotword);
		});
		// assistant
		socket.on('command', (text, stats) => {
			this.log('BB command', text, stats);
			this.emit('command', {text, stats});
		});
		
		
		// assistant
		socket.on('remove-application', (appId) => {
			this.log('remove-application', appId);
			this.log('this.state.activeApps', this.state.activeApps);
			this.log('this.state.activeApp', this.state.activeApp);
			if (appId in this.state.activeApps) {
				
				// if the application is active, abort app runId
				if (appId === this.state.activeApp.appId) {
					this.log('abort application', appId);
					this.emit('abort-run-'+this.state.activeApp.runId, 'the application has ended');
				}
				
				this.emit('application-removed', appId, this.state.activeApps[appId]);
				
				const activeApps = {...this.state.activeApps};
				delete activeApps[appId];
				this.setState({activeApps});
				
			}
		});
		// assistant
		socket.on('request-add-application', (applicationOptions, appInfo) => {
			this.log('request-add-application', applicationOptions);
			const activeApps = {...this.state.activeApps};
			activeApps[applicationOptions.id] = applicationOptions;
			this.setState({activeApps});
			// debugger;
			this.emit('application-added', applicationOptions.id, applicationOptions);
			this.socketEmit('application-added-'+applicationOptions.id, true);
		});
		// assistant
		socket.on('application-autostart', (appId) => {
			this.log('RECEIVED application-autostart', appId);
			const initialArgs = this.state.activeApps[appId].initialArgs;
			this.log('emit application-autostart', appId, initialArgs);
			this.emit('application-autostart', appId, initialArgs);
		});
		
		// assistant
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
	
	_console(data) {
		this.socketEmit('console', data);
	}
	_say(text, options) {
		return new Promise((resolve, reject) => {
			let id = Math.random().toString().substring(2);
			this.socket.once('say-end-'+id, () => {
				this.log('say-ended', id, text, options);
				resolve();
			});
			this.socketEmit('say', text, options, id);
		});
	}
	
	async startAssistant(args) {
		this.log('startAssistant', this.state.hotword, this.state.assistantName);
		this.emit('start', args);
	}
	
	async startApplication(assistant, runId, args, options) {
		this._appRun = {
			assistant, runId, args, options
		};
		this.log('startApplication', this.state.hotword, this._runApp);
		this.emit('start', args);
	}
	
	runApplication(appId, args, options) {
		if (appId in this.state.activeApps) {
			return new Promise((resolve, reject) => {
				// options.timeout;
				
				const runId = Math.random().toString().substring(2);
				
				const removeEvents = () => {
					this.removeListener('abort-run-'+runId, onAbortRun);
					this.socket.removeListener('run-application-response-' + runId, onResponse);
					this.socket.removeListener('run-application-abort-' + runId, onRemoteAbort);
				}
				
				const onRemoteAbort = (e) => {
					this.log('onRemoteAbort', e);
					removeEvents();
					reject(e);
				};
				
				const onResponse = (errValue, returnValue) => {
					removeEvents();
					if (errValue) reject(errValue);
					else resolve(returnValue);
				};
				
				const onAbortRun = (e) => {
					this.log('onAbortRun', e);
					// process.exit();
					removeEvents();
					reject(e);
				};
				
				this.setState({
					activeApp: {
						appId,
						runId
					}
				});
				
				this.once('abort-run-'+runId, onAbortRun);
				this.socket.once('run-application-response-' + runId, onResponse);
				this.socket.once('run-application-abort-' + runId, onRemoteAbort);
				
				this.socketEmit('run-application', runId, appId, args, options);
			});
		}
		else {
			throw 'application not found: '+appId;
		}
	}
	
	socketEmit() {
		let args = Array.prototype.slice.call(arguments);
		if (this.socket) this.socket.emit.apply(this.socket, args);
	}
	
	async registerAssistant(assistantClass, assistantOptions) {
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
				if (response[assistantOptions.hotword] && response[assistantOptions.hotword].success) {
					this.log('launch adapter', assistantClass);
					this.setState({
						hotword: assistantOptions.hotword
					});
					resolve();
				}
				else {
					reject();
				}
			});
			this.socket.emit('register-assistant', assistantOptions);
		});
	}
	
	async registerApplication(applicationClass, applicationOptions) {
		return new Promise((resolve, reject) => {
			if (!this.socket) {
				reject(new Error('no socket'));
				return;
			}
			if (!this.state.connected) {
				reject(new Error('not connected'));
				return;
			}
			
			this.socket.once('register-application-response', (response) => {
				if (response.success) {
					this.setState({
						applicationAssistant: applicationOptions.hotword
					});
					resolve(true);
				}
				else {
					this.log('oops', response);
					reject();
				}
			});
			this.socket.emit('register-application', applicationOptions);
		});
	}
	
	_delay(delayTime, resolveValue) {
		return new Promise(function(resolve) {
			setTimeout(resolve.bind(null, resolveValue), delayTime)
		});
	}
	
	_playSound(name, theme, onBegin) {
		return new Promise((resolve, reject) => {
			let id = Math.random().toString().substring(2);
			if (onBegin) this.socket.once('play-sound-begin-'+id, onBegin);
			this.socket.once('play-sound-end-'+id, resolve);
			this.socket.emit('play-sound', id, name, theme);
		});
	}
	
	returnError(e) {
		this.log('emit assistant-return-error', e);
		if (this._appRun) {
			// this.socketEmit('assistant-return-error', e.message);
			this.socketEmit('run-application-response-'+this._appRun.assistant+'-'+this._appRun.runId, e);
			delete this._appRun;
		}
		else {
			this.socketEmit('assistant-return-error', e);
		}
	}
	returnValue(r) {
		this.log('emit assistant-return-value', r);
		if (this._appRun) {
			this.socketEmit('run-application-response-'+this._appRun.assistant+'-'+this._appRun.runId, null, r);
			delete this._appRun;
		}
		else {
			this.socketEmit('assistant-return-value', r);
		}
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