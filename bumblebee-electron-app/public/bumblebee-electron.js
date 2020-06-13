const Jaxcore = require('jaxcore');
const {Service, createClientStore, createLogger} = Jaxcore;
const ipcMain = require('electron').ipcMain;
const soundplayer = require('./services/soundplayer');
const bumblebeeNode = require('./services/bumblebee-node');
const executeFunction = require('./execute-function');
const SpeechDownloader = require('./services/deepspeech-downloader');
const connectSay = require('./services/say');

const schema = {
	id: {
		type: 'string'
	},
	connected: {
		type: 'boolean'
	},
	deepspeechInstalled: {  // set by SpeechDownloader
		type: 'boolean'
	},
	recording: {
		type: 'boolean'
	}
};

function connectDeepspeech(bumblebeeElectron, deepspeech, bumblebeeNode) {
	
	process.env.NODE_ENV = 'dev';
	
	bumblebeeNode.on('data', function (intData, sampleRate, hotword, float32arr) {
		// console.log('bb', typeof intData, sampleRate, hotword, float32arr);
		
		// deepspeech.dualStreamData(intData, float32arr, 16000, hotword);
		deepspeech.streamData(intData,16000, hotword, float32arr);
	});
	
	deepspeech.on('no-recognition', function (hotword) {
		if (hotword) {
			bumblebeeElectron.playSound('cancel');
			let functionName = 'hotwordResults';
			let args = [hotword, null, null];
			bumblebeeElectron.execFunction(functionName, args, function () {
				console.log('deepspeechResults code complete');
			});
		}
	});
	
	ipcMain.on('simulate-hotword', (event, text, hotword) => {
		if (hotword === 'ANY') hotword = 'bumblebee';
		else if (hotword === 'OFF') return;
		
		bumblebeeNode.emit('hotword', hotword);
		// bumblebee.emit('hotword', hotword);
		
		deepspeech.setState({hotword});
		
		setTimeout(function() {
			deepspeech.processRecognition(text, {
				recogTime: 0,
				audioLength: 0,
				model: deepspeech.state.modelName,
				hotword
			});
		},1500);
		
	});
	
	ipcMain.on('simulate-stt', (event, text) => {
		deepspeech.processRecognition(text.toLowerCase(), {
			recogTime: 0,
			audioLength: 0,
			model: deepspeech.state.modelName
		});
	});
	
	deepspeech.on('vad', function (status) {
		// console.log('VAD', status);
		let functionName = 'updateVADStatus';
		let args = [status];
		bumblebeeElectron.execFunction(functionName, args);
	});
	
	deepspeech.on('hotword', function (hotword, text, stats) {
		console.log('DS hotword:'+hotword, 'text='+text, stats);
		let functionName = 'hotwordResults';
		let args = [hotword, text, stats];
		
		bumblebeeElectron.playSound('hail');
		
		bumblebeeElectron.execFunction(functionName, args);
	});
	
	deepspeech.on('recognize', function (text, stats) {
		console.log('DS recognize', text, stats);
		let functionName = 'deepspeechResults';
		let args = [text, stats];
		bumblebeeElectron.execFunction(functionName, args);
	});
	
	return deepspeech;
}

function connectBumblebeeNode(bumblebeeElectron, bumblebeeNode) {
	
	
	ipcMain.on('hotword-select', (event, hotword) => {
		if (hotword === 'OFF') {
			hotword = null;
			bumblebeeNode.setEnabled(false);
		}
		else {
			if (hotword === 'ANY') {
				hotword = null;
			}
			bumblebeeNode.setEnabled(true);
		}
		bumblebeeNode.setHotword(hotword);
	});
	
	bumblebeeNode.on('hotword', function (hotword) {
		console.log('');
		console.log('Hotword Detected:', hotword);
		let functionName = 'hotwordDetected';
		let args = [hotword];
		bumblebeeElectron.execFunction(functionName, args, function () {
			console.log('hotwordDetected code complete');
		});
	});
	
	ipcMain.on('microphone-muted', (event, muted) => {
		console.log('bumblebee.setMuted', muted)
		bumblebeeNode.setMuted(muted);
	});
	
	ipcMain.on('recording-start', (event) => {
		bumblebeeElectron.setState({recording: true});
		bumblebeeElectron.playSound('on');
		bumblebeeNode.start();
	});
	ipcMain.on('recording-stop', (event) => {
		bumblebeeElectron.setState({recording: false});
		bumblebeeElectron.playSound('off');
		bumblebeeNode.stop();
	});
}

let serviceInstance;

class BumblebeeElectron extends Service {
	constructor(defaults, store) {
		super(schema, store, defaults);
		this.log = createLogger('BumblebeeElectron');
		this.log('create', this.state);
		
		this.downloader = new SpeechDownloader(this);
		this.downloader.on('deepspeech-installed', () => {
			this.setState({
				deepspeechInstalled: true
			});
			this.startDeepspeech();
		})
		
		this.bumblebeeNode = connectBumblebeeNode(this, bumblebeeNode);
		
		this.say = connectSay(this);
	}
	
	init(jaxcore, callback) {
		this.jaxcore = jaxcore;
		
		this.startDeepspeech();
		
		jaxcore.startService('sayNode', {}, (err, sayNode) => {
			// sayNode.say('bumblebee starting');
			this.sayNode = sayNode;
			callback(jaxcore);
		});
	}
	
	playSound(type) {
		soundplayer(__dirname + '/sounds/startrek1/'+type);
	}
	
	startDeepspeech() {
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
				
				// console.log('deepspeech', deepspeech);
				this.deepspeech = connectDeepspeech(this, deepspeech, bumblebeeNode);
				
			});
			
			// jaxcore.defineAdapter('Bumblebee Deepspeech Adapter', {
			// 	adapterType: 'bumblebee-speech',
			// 	serviceProfiles: [
			// 		'Bumblebee Electron',
			// 		'Deepspeech English',
			// 		'Say Node'
			// 	]
			// });
			//
			// jaxcore.connectAdapter(null, 'Bumblebee Speech Adapter');
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
			
			debugger;
			
			event.reply('electron-ready', this.state);
		});
		
		ipcMain.handle('say-data', async (event, text, options) => {
			if (options && options.profile) {
				debugger;
			}
			else {
				debugger;
			}
			const result = await this.sayNode.getAudioData(text, options);
			return result;
		});
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
		// console.log('BumblebeeElectron getOrCreateInstance', serviceId, serviceConfig);
		if (serviceInstance) {
			callback(null, serviceInstance, false);
		}
		else {
			// console.log('getOrCreateInstance BumblebeeElectron', serviceConfig);
			serviceConfig = {
				id: 'simulatorService'
			};
			serviceInstance = new BumblebeeElectron(serviceConfig, serviceStore);
			
			// console.log('CREATED serviceInstance', serviceInstance);
			
			callback(null, serviceInstance, true);
		}
	}
}

module.exports = BumblebeeElectron;