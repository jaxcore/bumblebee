const Jaxcore = require('jaxcore');
const {Service, createLogger} = Jaxcore;
const ipcMain = require('electron').ipcMain;
const executeFunction = require('./execute-function');
const SpeechDownloader = require('./services/deepspeech-downloader');
const BumblebeeNode = require('./bumblebee-node/BumblebeeNode');

const schema = {
	id: {
		type: 'string'
	},
	connected: {
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
			this.startDeepspeech(function() {
				console.log('done');
			});
		});
		
		global.app = this;
	}
	
	init(jaxcore, callback) {
		this.jaxcore = jaxcore;
		
		this.jaxcore.defineService('Say', 'sayNode', {});
		
		this.jaxcore.startServiceProfile('Say',  (err, sayNode) => {
			this.sayNode = sayNode;
			this.startDeepspeech((err, bumblebee) => {
				callback(err, bumblebee);
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
				debug: false
			});
			
			this.jaxcore.startServiceProfile('Deepspeech English',  (err, deepspeech) => {
				if (err) {
					console.log('Deepspeech could not be started');
					console.log('err', err);
					process.exit();
					return;
				}
				
				this.bumblebee = new BumblebeeNode(this.jaxcore, this, deepspeech, this.sayNode);
				
				callback(null, this.bumblebee);
			});
		}
		else {
			console.log('deepspeech not installed', this.downloader);
			
			callback();
		}
	}
	
	setWindow(mainWindow) {
		this.mainWindow = mainWindow;
		
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