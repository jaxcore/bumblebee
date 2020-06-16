import EventEmitter from 'events';
import {connectSayQueue} from './SayQueue';
import {connectMicrophone} from './Microphone';
import {connectPlaySound} from './playSound';
import drawVADCanvas, {clearVADCanvas} from './drawVADCanvas';

import choose from './choose';

const ipcRenderer = window.ipcRenderer;

class BumblebeeClient extends EventEmitter {
	constructor(app) {
		super();
		
		this.app = app;
		this.apps = {};
		this.assistants = {};
		
		this.choose = choose;
		
		this.microphone = connectMicrophone(this, app);
		this.sayQueue = connectSayQueue(this, app);
		this.playSound = connectPlaySound(this, app);
		
		this.sayQueue.setVolume(app.state.sayVolume);
		
		// receive speech recognition result by a synchronous message from public/electron.js
		window.hotwordDetected = (hotword) => {
			this.app.addSpeechOutput('hotwordDetected '+hotword);
			this.setHotwordDetected(hotword);
		};
		
		window.hotwordResults = (hotword, text, stats) => {
			// debugger;
			this.app.addSpeechOutput('hotwordCommand '+hotword+' '+text);
			
			if (!text) {
				// debugger;
				this.app.addSpeechOutput({
					text: '---',
					stats,
					type: 'hotcommand'
				});
			}
			else {
				// debugger;
				this.app.addSpeechOutput({
					text,
					stats,
					type: 'hotcommand'
				});
			}
			this.emit('hotwordCommand', text, stats);
			this.setHotwordDetected(null);
		};
		
		app.vadStatusRef.current.width = window.innerWidth;
		
		window.updateVADStatus = (status) => {
			drawVADCanvas(app.vadStatusRef.current, status);
		};
		
		
		window.deepspeechResults = (text, stats) => {
			// debugger;
			console.log('deepspeech results', text, stats);
			
			if (stats.hotword) {
				debugger;
				// this.emit('hotwordRecognize', text, stats);
			}
			else {
				this.emit('recognize', text, stats);
			}
			
			this.setHotwordDetected(null);
		};
	}
	
	addAssistant(hotword, appName, assistantFunction) {
		const apps = {};
		// apps[appName] = assistantFunction;
		this.assistants[hotword] = {
			name: appName,
			assistant: assistantFunction,
			hotword,
			apps
		}
	}
	removeAssistant(hotword) {
		//todo: this.assistants[hotword].destroy();
		delete this.assistants[hotword];
		delete this.apps[hotword];
	}
	
	addApp(hotword, appName, appFunction) {
		if (this.assistants[hotword]) {
			this.assistants[hotword].apps[appName] = {
				name: appName,
				app: appFunction,
				hotword
			}
		}
		else {
			debugger;
		}
	}
	
	displayApp(hotword, appName, logo) {
		this.app.displayApp(hotword, appName, logo);
	}
	
	// async launchAssistant(hotword) {
	// 	debugger;
	// 	// debugger;
	// 	// if (!this.assistants[hotword]) {
	// 	// 	this.assistants[hotword] = new BumblebeeAssistant(hotword);
	// 	// 	return this.assistants[hotword].main(this);
	// 	// }
	// 	// else {
	// 	//
	// 	// }
	// 	// return this.launch(hotword, null, true);
	// }
	
	async launchApp(fn) {
	
	}
	
	async launch(hotword, appName, isAssistant) {
		let r;
		// debugger;
		
		if (!this.assistants[hotword]) {
			await this.say('there is no assistant for ' + hotword);
			// debugger;
			throw new Error('invalid assistant');
		}
		
		let appInfo;
		if (appName === null && isAssistant) {
			appInfo = this.assistants[hotword];
		}
		else appInfo = this.assistants[hotword].apps[appName];
		
		if (!appInfo) {
			await this.say('there is no application named ' + appInfo.name);
			// debugger;
			throw new Error('invalid app');
		}
		
		this.console('launching: ' + hotword+':'+appInfo.name);
		
		const previousAppInfo = this.currentAppInfo;
		
		const type = isAssistant? 'assistant' : 'application';
		const description = appInfo.name + ' ' + type;
		
		if (isAssistant) await this.say('starting the '+description);
		else await this.say('launching the ' + description);
		
		// debugger;
		
		try {
			
			this.currentAppInfo = appInfo;
			
			if (isAssistant) {
				// debugger;
				r = await appInfo.assistant(this);
			}
			else if (appInfo.app) {
				// debugger;
				r = await appInfo.app(this);
			}
			
			let previousName = previousAppInfo? previousAppInfo.name : 'main menu';
			await this.say('The ' + appInfo.name + ' ' + type + ' has ended returning to ' + previousName);
			
		} catch (e) {
			if (e.error && e.error.timedOut) {
				let previousName = previousAppInfo? previousAppInfo.name : 'main menu';
				await this.say('the ' + description + ' has timed out, returning to ' + previousName);
			}
			else {
				console.error(e);
				this.console('Error: ' + e.toString());
				debugger;
				await this.say('the ' + description + ' encountered an error');
			}
			r = false;
		}
		
		this.currentAppInfo = previousAppInfo;
		
		return r;
	}
	
	
	console(component) {
		this.app.console(component);
	}
	
	async say() {
		return this.sayQueue.say(...arguments);
	}
	
	setSayProfile(profile) {
		this.sayQueue.setProfile(profile);
	}
	
	simulateHotword(text) {
		// debugger;
		ipcRenderer.send('simulate-hotword', text, this.app.state.hotword);
		// this.app.setMuted(true);
		// setTimeout(() => {
		// 	this.app.setMuted(false);
		// },1000);
	}
	
	simulateTTS(text) {
		ipcRenderer.send('say', text);
	}
	
	simulateSTT(text) {
		if (this.app.state.muted) {
			this.console('muted');
			return;
		}
		// debugger;
		// this.app.setConsoleInputText(text);
		ipcRenderer.send('simulate-stt', text);
	}
	
	changeHotword(value) {
		let hotword = value;
		let hotwordEnabled = true;
		if (value === 'OFF') {
			hotwordEnabled = false;
		}
		this.app.setState({
			hotword,
			hotwordEnabled
		});
		ipcRenderer.send('hotword-select', hotword);
	}
	
	toggleRecording() {
		if (this.app.state.recording) this.stopRecording()
		else this.startRecording();
	}
	
	startRecording() {
		if (!this.app.state.config.deepspeechInstalled) {
			this.app.showInstall(true);
			return;
		}
		if (!this.app.state.recording) {
			if (this.app.state.useSystemMic) {
				ipcRenderer.send('recording-start');
			}
			this.app.setState({
				recording: true
			}, () => {
				this.microphone.start();
			});
		}
		this.emit('recording-started');
	};
	
	async hotwordRecognize(options) {
		if (!options) options = {};
		return new Promise((resolve, reject) => {
			let timedOut = false;
			
			if (options.timeout) {
				let timer = setTimeout(function () {
					timedOut = true;
					reject({
						error: {
							timedOut: true
						}
					});
				}, options.timeout || 10000);
				
				this.once('hotwordCommand', function (text, stats) {
					clearTimeout(timer);
					if (!timedOut) resolve({text, stats});
				});
			}
			else {
				this.once('hotwordCommand', function (text, stats) {
					resolve({text, stats});
				});
			}
		});
	}
	
	async recognizeAny() {
		return new Promise((resolve, reject) => {
			let returned = false;
			const hotwordHandler = function (hotword) {
				if (returned) return;
				returned = true;
				// debugger;
				this.removeListener('hotwordCommand', hotwordCommandHandler);
				this.removeListener('recognize', recognizeHandler);
				resolve({
					hotword: {
						hotword
					}
				});
			};
			const hotwordCommandHandler = function (text, stats, hotword) {
				if (returned) return;
				returned = true;
				// debugger;
				this.removeListener('hotword', hotwordHandler);
				this.removeListener('recognize', recognizeHandler);
				resolve({
					hotwordCommand: {
						text, stats, hotword
					}
				});
			};
			const recognizeHandler = function (text, stats) {
				if (returned) return;
				returned = true;
				// debugger;
				this.removeListener('hotword', hotwordHandler);
				this.removeListener('hotwordCommand', hotwordCommandHandler);
				resolve({
					recognize: {
						text, stats
					}
				});
			};
			this.once('hotword', hotwordHandler);
			this.once('hotwordCommand', hotwordCommandHandler);
			this.once('recognize', recognizeHandler);
		});
	}
	
	async recognize(options) {
		if (!options) options = {};
		return new Promise((resolve, reject) => {
			let timedOut = false;
			
			if (options.timeout) {
				let timer = setTimeout(function () {
					timedOut = true;
					reject({
						error: {
							timedOut: true
						}
					});
				}, options.timeout || 10000);
				
				this.once('recognize', function (text, stats) {
					clearTimeout(timer);
					if (!timedOut) resolve({text, stats});
				});
			}
			else {
				this.once('recognize', function (text, stats) {
					resolve({text, stats});
				});
			}
		});
	}
	
	setHotwordDetected(hotword) {
		
		if (hotword) {
			this.emit('hotword', hotword);
		}
		
		if (this.app.state.hotwordDetected !== hotword) {
			if (hotword) {
				// this.app.addSpeechOutput({
				// 	hotword,
				// 	type: 'hotword'
				// });
			}
			this.app.setState({
				hotwordDetected: hotword,
				logo: hotword ? this.app.logos.hotword : this.app.logos.default
			});
			if (hotword) {
				if (this.analyser) this.analyser.setLineColor('#d6bc22');
			}
			else {
				if (this.analyser) this.analyser.setLineColor('#fff');
			}
		}
	}
	
	async onRecordingStarted() {
		return new Promise((resolve, reject) => {
			this.once('recording-started', resolve);
		});
	}
	
	async onRecordingStopped() {
		return new Promise((resolve, reject) => {
			this.once('recording-stopped', resolve);
		});
	}
	
	stopRecording() {
		if (!this.app.state.config.deepspeechInstalled) {
			return;
		}
		
		if (this.app.state.recording) {
			if (this.app.state.useSystemMic) {
				ipcRenderer.send('recording-stop');
			}
			clearInterval(this.app.recordingInterval);
			this.app.setState({
				recording: false
			}, () => {
				this.microphone.stop();
				if (this.analyser) this.analyser.stop();
				if (this.app.vadStatusRef) clearVADCanvas(this.app.vadStatusRef.current);
			});
		}
		this.emit('recording-stopped');
	};
	
	setMuted(muted) {
		this.app.setState({
			muted
		});
		this.microphone.setMuted(muted);
		if (this.app.state.useSystemMic) {
			ipcRenderer.send('microphone-muted', muted);
		}
	}
	
	toggleMute() {
		this.app.setMuted(!this.app.state.muted);
	};
	
	clearConsole() {
		this.app.setState({recognitionOutput: []});
	}
	
	playSoundNode(name, theme) {
		ipcRenderer.send('play-sound', name, theme).then(r => {
			debugger;
		});
	}
	
}

export default BumblebeeClient;