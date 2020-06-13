import EventEmitter from 'events';
import {connectSayQueue} from './SayQueue';
import {connectMicrophone} from './Microphone';
import drawVADCanvas, {clearVADCanvas} from './drawVADCanvas';

import choose from './choose';

const ipcRenderer = window.ipcRenderer;

class BumbleBee extends EventEmitter {
	constructor(app) {
		super();
		
		this.app = app;
		this.apps = {};
		
		this.choose = choose;
		
		this.microphone = connectMicrophone(this, app);
		this.sayQueue = connectSayQueue(this, app);
		
		this.sayQueue.setVolume(app.state.sayVolume);
		
		// receive speech recognition result by a synchronous message from public/electron.js
		window.hotwordDetected = (hotword) => {
			// debugger;
			this.setHotwordDetected(hotword);
		};
		
		window.hotwordResults = (hotword, text, stats) => {
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
			this.setHotwordDetected(null);
		};
		
		app.vadStatusRef.current.width = window.innerWidth;
		
		window.updateVADStatus = (status) => {
			drawVADCanvas(app.vadStatusRef.current, status);
		};
		
		window.deepspeechResults = (text, stats) => {
			console.log('deepspeech results', text, stats);
			this.emit('recognize', text, stats);
			
			this.setHotwordDetected(null);
		};
	}
	
	addApp(appName, appFunction) {
		this.apps[appName] = {
			name: appName,
			app: appFunction
		}
	}
	
	async launch(appName) {
		let r;
		// debugger;
		
		this.console('launching: '+this.apps[appName].name);
		
		if (!(appName in this.apps)) {
			await this.say('there is no application named '+appName);
			return false;
		}
		
		try {
			const a = this.apps[appName];
			r = await a.app(this);
			await this.say('The ' + this.apps[appName].name + ' application has ended');
		}
		catch(e) {
			this.console('Error: '+e.toString());
			debugger;
			await this.say('the '+this.apps[appName].name+' application encountered an error');
			r = false;
		}
		
		return r;
		
		// if (appName === 'MainMenu') {
		// 	return this.launch(appName);
		// }
		//
		// return r;
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
		this.app.setConsoleInputText(text);
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
	
	async recognize(options) {
		if (!options) options = {};
		return new Promise((resolve, reject) => {
			let timedOut = false;
			
			if (options.timeout) {
				let timer = setTimeout(function () {
					timedOut = true;
					reject();
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
	
}

export default BumbleBee;