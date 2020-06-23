const Jaxcore = require('jaxcore');
const {Service, createLogger} = Jaxcore;
const ipcMain = require('electron').ipcMain;
const executeFunction = require('./execute-function');
const SpeechDownloader = require('./services/deepspeech-downloader');
const BumblebeeNode = require('./bumblebee-node/BumblebeeNode');
const fs = require('fs');
const Path = require('path');
// const { Worker } = require('worker_threads');
// const electron = require('electron');
const BumblebeeAPI = require('bumblebee-api');
const BumblebeeAssistant = require('./bumblebee-assistant/BumblebeeAssistant');
const isDev = require('electron-is-dev');

const schema = {
	id: {
		type: 'string'
	},
	connected: {
		type: 'boolean'
	},
	servicesStarted: {
		type: 'boolean'
	},
	deepspeechInstalled: {  // set by DeepSpeechDownloader
		type: 'boolean'
	},
	hotwordsAvailable: {
		type: 'array',
		defaultValue: ['bumblebee', 'grasshopper', 'porcupine', 'terminator', 'hey_edison']
	},
	assistants: {		// assistants[hotword] = socket.id
		type: 'object'
	},
	socketAssistants: {   //socketAssistants[socket.id] = hotword
		type: 'object'
	},
	activeAssistant: {
		type: 'string'
	}
};

let serviceInstance;

class BumblebeeElectron extends Service {
	constructor(defaults, store) {
		super(schema, store, defaults);
		this.log = createLogger('BumblebeeElectron');
		this.log('create', this.state);
		
		this.allHotwords = ['bumblebee', 'grasshopper', 'porcupine', 'terminator', 'hey_edison'];
		this.assistantNames = {
			'bumblebee': 'Bumblebee',
			'grasshopper': 'Grasshopper',
			'porcupine': 'Porcupine',
			'terminator': 'Terminator',
			'hey_edison': 'Edison'
		};
		
		this.downloader = new SpeechDownloader(this);
		
		this.downloader.on('deepspeech-installed', () => {
			this.setState({
				deepspeechInstalled: true
			});
			// this.startDeepspeech(function() {
			// 	console.log('done');
			// });
			// debugger;
		});
		
		global.app = this;
	}
	
	init(jaxcore, mainWindow) {
		this.jaxcore = jaxcore;
		this.setWindow(mainWindow);
	}
	
	async initServer() {
		if (this.bumblebee) {
			debugger;
			return true;
		}
		await this.startServices();
		if (!isDev) {
			this.startBumblebeeAssistant();
		}
		return true;
	}
	
	startBumblebeeAssistant() {
		BumblebeeAPI.connectAssistant('bumblebee', BumblebeeAssistant, {
			autoStart: true,
			timeout: 3000
		});
	}
	
	async startServices() {
		if (this.state.servicesStarted) {
			return true;
		}
		return new Promise((resolve, reject) => {
			
			// const localPath = Path.resolve('.');
			// const localPath = __dirname;
			// const typelocalPath = typeof __static;
			//
			// return;
			
			// const localPath = Path.resolve('./');
			//

			// const localPath = Path.resolve(electron.app.getPath('appData'), 'com.jaxcore.bumblebee');
			// this.execFunction('systemError', ['localPath = '+localPath]);
			// const sayWorkerPaths = {
			// 	espeak: localPath + '/espeak-all-workerthread.js',
			// 	sam: localPath + '/sam-workerthread.js'
			// }
			//
			// // this.execFunction('systemError', ['worker files: '+JSON.stringify(sayWorkerPaths)]);
			//
			// if (!fs.existsSync(sayWorkerPaths.espeak) || !fs.existsSync(sayWorkerPaths.espeak)) {
			// 	this.execFunction('systemError', ['worker files not found '+JSON.stringify(sayWorkerPaths)]);
			// }
			// else {
			// 	// this.execFunction('systemError', ['worker files FOUND '+JSON.stringify(sayWorkerPaths)]);
			// 	// return;
			// }
			
			const workerContent = {
				espeak: fs.readFileSync(Path.resolve(__dirname, 'say-workerthreads', 'espeak-all-workerthread.js'), { encoding: 'utf8' }),
				sam: fs.readFileSync(Path.resolve(__dirname, 'say-workerthreads', 'sam-workerthread.js'), { encoding: 'utf8' })
			}
			
			//
			// const worker = new Worker(workerContent.espeak, { eval: true });
			//
			// console.log(worker);
			//
			// return;
			
			// const workerx = new Worker(sayWorkerPaths.espeak);
			// this.execFunction('systemError', ['workerx'+(typeof workerx)]);

			// return;
			//
			// const worker = new Worker(sayWorkerPaths.espeak);
			// this.execFunction('systemError', ['worker'+(typeof worker)]);

			// return;
			
			this.jaxcore.defineService('Say', 'sayNode', {
				// workerPaths: sayWorkerPaths
				useWorkerContent: true
				// workerPath: 'workerthreads'
			});
			
			this.jaxcore.startServiceProfile('Say', (err, sayNode) => {
				if (err) {
					console.log('sayNode err', err);
					debugger;
					this.execFunction('systemError', [err.toString()]);
					//reject(err);
					return;
				}
				
				sayNode.setWorkerContent(workerContent);
				
				// debugger;
				//
				// this.execFunction('systemError', ['sayNode worker files '+JSON.stringify(sayNode.state.workerPaths)]);
				//
				// const worker = new Worker(sayWorkerPaths.espeak);
				//
				// console.log('worker', worker);
				
				// return;
				
				this.sayNode = sayNode;
				
				// this.startDeepspeech((err, bumblebee) => {
				// 	callback(err, bumblebee);
				// });
				
				this.startDeepspeech((err, deepspeech) => {
					if (err) {
						reject(err);
						return;
					}
					
					this.execFunction('systemError', ['deepspeech '+JSON.stringify(deepspeech.state)]);
					
					deepspeech.on('heartbeat', (count) => {
						this.execFunction('systemError', ['heartbeat '+count]);
					});
					
					// return;
					this.deepspeech = deepspeech;
					// debugger;
					
					this.jaxcore.startServiceProfile('Bumblebee Assistant Server', (err, bbWebsocketServer) => {
						if (err) {
							reject(err);
							return;
						}
						this.bbWebsocketServer = bbWebsocketServer;
						
						// debugger;
						const bumblebee = new BumblebeeNode(this);
						this.bumblebee = bumblebee;
						
						this.setState({servicesStarted: true});
						
						resolve(true);
					});
					
					// bbWebsocketServer.init(bumblebee, app, onSocketConnect, onSocketDisconnect);
					// callback(err, deepspeech);
				});
			});
		});
	}
	
	startDeepspeech(callback) {
		if (this.state.deepspeechInstalled) {
			
			let modelsPath = this.downloader.modelsPath;
			
			this.jaxcore.defineService('Deepspeech English', 'deepspeech', {
				modelName: 'english',
				modelPath: modelsPath,
				silenceThreshold: 300,
				vadMode: 'VERY_AGGRESSIVE',
				debug: true
			});
			
			this.jaxcore.startServiceProfile('Deepspeech English',  (err, deepspeech) => {
				if (err) {
					console.log('Deepspeech could not be started');
					console.log('err', err);
					process.exit();
					return;
				}
				
				// this.bumblebee = new BumblebeeNode(this.jaxcore, this, deepspeech, this.sayNode);
				
				// callback(null, this.bumblebee);
				callback(null, deepspeech);
			});
		}
		else {
			console.log('deepspeech not installed', this.downloader);
			
			callback();
		}
	}
	
	startServer(callback) {
		// return new Promise(function(resolve, reject) {
			this.jaxcore.startServiceProfile('Bumblebee Assistant Server', callback);
			// this.jaxcore.startServiceProfile('Bumblebee Assistant Server', (err, bbWebsocketServer) => {
			//
			// 	if (err) {
			// 		debugger;
			// 		reject(err);
			// 	}
			// 	else {
			// 		debugger;
			//
			// 		// bbWebsocketServer.init(bumblebee, app, onSocketConnect, onSocketDisconnect);
			//
			// 		// bumblebee.bbWebsocketServer = bbWebsocketServer;
			// 		// bumblebee.say('okay, starting server...');
			//
			// 		// callback(bbWebsocketServer);
			//
			// 		resolve(bbWebsocketServer);
			// 	}
			// 	// bbWebsocketServer
			// })
		// })
	}
	
	setWindow(mainWindow) {
		// this.mainWindow = mainWindow;
		
		this.execFunction = function(functionName, args, callback) {
			executeFunction(mainWindow, functionName, args, callback);
		};
		
		ipcMain.on('get-bumblebee-config', async (event) => {
			event.returnValue = this.state;
		});
		
		ipcMain.on('client-ready', (event, arg) => {
			console.log('client-ready');
			event.reply('electron-ready', this.state);
		});
		
		ipcMain.handle('bumblebee-start-server', async (event) => {
			const r = await this.initServer();
			// debugger;
			return r;
			// console.log('bumblebee-start-service', hotword, command);
			// try {
			// 	const server = await startServer();
			// 	console.log('server', server.state);
			// 	debugger;
			// 	return true;
			// }
			// catch(e) {
			// 	return {
			// 		error: e.toString()
			// 	}
			// }
		});
	}
	
	updateClientConfig() {
		this.execFunction('updateClientConfig', this.state);
	}
	
	connect() {
		if (!this.state.connected) {
			this.setState({
				connected: true
			});
			this.emit('connect');
		}
	};
	
	destroy() {
		this.emit('teardown');
		debugger;
	}
	
	static id() {
		return 'BumblebeeElectron';
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		if (serviceInstance) {
			callback(null, serviceInstance, false);
		}
		else {
			serviceConfig = {
				id: 'BumblebeeElectron'
			};
			serviceInstance = new BumblebeeElectron(serviceConfig, serviceStore);
			callback(null, serviceInstance, true);
		}
	}
}

module.exports = BumblebeeElectron;