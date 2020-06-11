import React, {Component} from 'react';
import Microphone from './Microphone';
import {SpectrumAnalyser} from 'bumblebee-hotword';
import {say, sayQueue} from './SayQueue';
import EventEmitter from 'events';

import drawVADCanvas, {clearVADCanvas} from './drawVADCanvas';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import SettingsIcon from '@material-ui/icons/Settings';

import InstallDialog from './install/InstallDialog';

const ipcRenderer = window.ipcRenderer;

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			connected: false,
			recording: false,
			muted: false,
			hotword: 'ANY',
			
			microphoneVolume: 1,
			sayVolume: 1,
			
			recognitionOutput: [],
			logo: 'logo-autobots',
			
			controlsVisible: false,
			useSystemMic: true,
			
			showInstallDialog: false,
			
			inputMode: 'stt',
			config: {}
		};
		
		this.speechOscilloscopeRef = React.createRef();
		this.sayOscilloscopeRef = React.createRef();
		this.vadStatusRef = React.createRef();
		
		this.consoleInputRef = React.createRef();
		
		this.logos = {
			default: 'logo-autobots',
			hotword: 'logo-autobots-hotword',
			// speaking: 'logo-autobots-speaking',
			speaking: 'logo-autobots-speaking',
		};
		
		this.inputModes = {
			tts: say,
			stt: this.simulateSTT,
			hot: this.simulateHotword
		}
		
		this.events = new EventEmitter();
		
		window.app = this;
	}
	
	componentDidMount() {
		let micOptions = {
			volume: this.state.microphoneVolume,
			chunkSize: 8192 //1024,
		};
		
		if (!this.state.useSystemMic) {
			micOptions = {
				...micOptions,
				ipcRenderer,
				ipcStreamEvent: 'stream-data',
				ipcResetEvent: 'stream-reset'
			}
		}
		this.microphone = new Microphone(micOptions);
		
		this.microphone.on('analyser', (analyser) => {
			var canvas = this.speechOscilloscopeRef.current;
			canvas.width = window.innerWidth;
			canvas.height = 100;
			this.analyser = new SpectrumAnalyser(analyser, canvas);
			this.analyser.setLineColor('#eee');
			this.analyser.setBackgroundColor('#222');
			this.analyser.start();
		});
		
		sayQueue.sayOscilloscopeRef = this.sayOscilloscopeRef;
		sayQueue.lineColor = '#5d5dff'; //'#4c4cd5'; //'#55e';
		
		sayQueue.on('say', (text, options, data) => {
			this.addSpeechOutput({
				text,
				options,
				type: 'tts'
			});
		});
		sayQueue.on('playing', () => {
			
			this.setMuted(true);
			this.setState({
				sayPlaying: true,
				logo: this.logos.speaking
			});
		});
		sayQueue.on('stopped', () => {
			this.setMuted(false);
			this.setState({
				sayPlaying: false,
				logo: this.logos.default
			});
		});
		
		
		ipcRenderer.on('electron-ready', (event, config) => {
			this.setElectronConfig(config);
			
			if (this.state.config.deepspeechInstalled) {
				if (this.state.config.recording) {
					this.startRecording();
				}
			}
			else {
				// this.showInstall(true);
				// return;
				say('Welcome to bumblebee').then(() => {
					say('It appears you do not have DeepSpeech installed').then(() => {
						say('Would you like to install it now?').then(() => {
							this.showInstall(true);
						});
					});
				});
			}
			console.log('electron ready');
		});
		
		// receive speech recognition result by a synchronous message from public/electron.js
		window.hotwordDetected = (hotword) => {
			this.addSpeechOutput({
				hotword,
				type: 'hotword'
			});
			
			this.setHotwordDetected(hotword);
		};
		
		window.hotwordResults = (hotword, text, stats) => {
			if (!text) {
				this.addSpeechOutput({
					text: '---',
					stats,
					type: 'command'
				});
			}
			else {
				this.addSpeechOutput({
					text,
					stats,
					type: 'command'
				});
			}
			this.setHotwordDetected(null);
		};
		
		this.vadStatusRef.current.width = window.innerWidth;
		
		window.updateVADStatus = (status) => {
			drawVADCanvas(this.vadStatusRef.current, status);
		};
		
		window.deepspeechResults = (text, stats) => {
			console.log('deepspeech results', text, stats);
			this.events.emit('recognize', text, stats);
			this.addSpeechOutput({
				text,
				stats,
				type: 'recognize'
			});
			this.setHotwordDetected(null);
		};
		
		console.log('send client-ready');
		ipcRenderer.send('client-ready');
	}
	
	setElectronConfig(config) {
		this.setState({
			connected: true,
			config
		});
		
		sayQueue.setVolume(this.state.sayVolume);
	}
	
	updateConfig() {
		let config = ipcRenderer.sendSync('get-bumblebee-config');
		this.setElectronConfig(config);
	}
	
	deepspeechInstalled() {
		this.setState({
			showInstallDialog: false,
		});
		this.updateConfig();
		this.startTutorial();
	}
	
	startTutorial() {
		this.stopRecording();
		this.setState({
			mode: 'intro-tutorial'
		});
		say('Congratulations').then(() => {
			say('DeepSpeech has been installed').then(() => {
				say('To begin, turn on the microphone').then(() => {
					this.events.once('recording-started', () => {
						say('Now say something').then(() => {
							this.events.once('recognize', (text) => {
								say('You said, '+text).then(() => {
									say('This concludes the introduction.').then(() => {
										say('For more information at any time, just say, bumblebee help').then(() => {
											say('Or visit bumblebee on github').then(() => {
												this.simulateSTT('LINK: https://github.com/jaxcore/bumblebee');
												this.setState({
													mode: 'default'
												});
											});
										});
									});
								});
							});
						});
					})
				});
			});
		})
	}
	
	showInstall(show) {
		this.setState({
			showInstallDialog: show
		});
	}
	
	addSpeechOutput(data) {
		const {recognitionOutput} = this.state;
		recognitionOutput.unshift(data);
		if (recognitionOutput.length > 100) recognitionOutput.length = 100;
		this.setState({recognitionOutput});
	}
	
	setHotwordDetected(hotword) {
		if (this.state.hotwordDetected !== hotword) {
			this.setState({
				hotwordDetected: hotword,
				logo: hotword? this.logos.hotword : this.logos.default
			});
			if (hotword) {
				if (this.analyser) this.analyser.setLineColor('yellow');
			}
			else {
				if (this.analyser) this.analyser.setLineColor('#fff');
			}
		}
	}
	
	render() {
		const sayClass = this.state.sayPlaying? 'visible' : 'hidden';
		
		const Mic = this.state.recording? MicIcon : MicOffIcon;
		
		return (<div className="App">
			
			{this.state.showInstallDialog? (<InstallDialog onInstalled={() => this.deepspeechInstalled() } onCancel={() => this.showInstall(false)} />) : null}
			
			<div id="header">
				
				<canvas id="vad-status" ref={this.vadStatusRef} width="10" height="9" />
				
				<div id="banner">
					
					<canvas id="speech-oscilloscope" className="oscilloscope" ref={this.speechOscilloscopeRef} />
					<canvas id="say-oscilloscope" className={"oscilloscope "+sayClass} ref={this.sayOscilloscopeRef} />
					
					<div id="logo" onClick={e => this.toggleControls()}>
						<img src={"images/logos/"+this.state.logo+".png"} />
					</div>
					
					<div id="mic-icon" className="banner-icon" onClick={e => this.toggleRecording() }>
						<Mic />
						<div className="text">Mic {this.state.recording?'On':'Off'}</div>
					</div>
					
					<div id="settings-icon" className="banner-icon" onClick={e => this.showSettings() }>
						<SettingsIcon />
						<div className="text">Settings</div>
					</div>
					
				</div>
			</div>
			
			{this.renderContent()}
			
			{this.renderConsoleInput()}
			
		</div>);
	}
	
	toggleControls() {
		this.setState({
			controlsVisible: !this.state.controlsVisible
		});
	}
	
	renderContent() {
		return (<div id="home" className="content">
			{/*{this.renderControls()}*/}
			{this.renderRecognitionOutput()}
		</div>);
	}
	
	renderConsoleInput() {
		let inputModePlaceholder;
		if (this.state.inputMode === 'stt') inputModePlaceholder = "speech to text";
		if (this.state.inputMode === 'tts') inputModePlaceholder = "text to speech";
		if (this.state.inputMode === 'hot') inputModePlaceholder = "hotword commands";
		
		return (<div id="console-input">
			
			<select onChange={e => this.changeInputMode(e.target.options[e.target.selectedIndex].value) } value={this.state.inputMode}>
				<option value="stt">STT</option>
				<option value="tts">TTS</option>
				<option value="hot">HOT</option>
			</select>
			
			<input type="text" ref={this.consoleInputRef} placeholder={inputModePlaceholder} onKeyPress={this.keypressConsoleInput}/>
			
			<button onClick={e => this.executeConsoleInput()}>
				Execute
			</button>
			
			<button onClick={e => this.clearOutput()}>
				Clear
			</button>
		</div>);
	}
	
	renderControls() {
		const controlsClass = this.state.controlsVisible? 'block' : 'none';
		
		return (<div className={'controls '+controlsClass}>
			
			Hotword: <select onChange={e => this.changeHotword(e.target.options[e.target.selectedIndex].value) } value={this.state.hotword}>
				<option value="OFF">- OFF -</option>
				<option value="bumblebee">bumblebee</option>
				<option value="grasshopper">grasshopper</option>
				<option value="hey_edison">hey_edison</option>
				<option value="porcupine">porcupine</option>
				<option value="terminator">terminator</option>
				<option value="ANY">- ANY -</option>
			</select>
			
			<br/><br/>
			
			<button disabled={!this.state.recording} onClick={e => this.toggleMute()}>
				{this.state.muted? 'Unmute' : 'Mute'}
			</button>
			
			
			
			<button onClick={e => { ipcRenderer.send('dev-tools'); }}>
				Dev Console
			</button>
			
			<br/>
		
		</div>);
	}
	renderRecognitionOutput() {
		return (<ul>
			{this.state.recognitionOutput.map((data, index) => {
				let text = data.text;
				if (data.type === 'command') {
					text = 'COMMAND: '+text;
				}
				if (data.type === 'tts') {
					text = 'TTS: '+text;
				}
				if (data.type === 'hotword') {
					text = 'HOTWORD: '+data.hotword;
				}
				return (<li key={index}>{text}</li>);
			})}
		</ul>)
	}
	
	changeInputMode(value) {
		this.setState({
			inputMode: value
		});
	}
	
	keypressConsoleInput = (e) => {
		if (e.key === 'Enter') {
			this.executeConsoleInput();
		}
	}
	executeConsoleInput() {
		let text = this.consoleInputRef.current.value;
		this.inputModes[this.state.inputMode].call(this, text);
	}
	
	simulateHotword(text) {
		ipcRenderer.send('simulate-hotword', text, this.state.hotword);
		// this.setMuted(true);
		// setTimeout(() => {
		// 	this.setMuted(false);
		// },1000);
	}
	
	simulateSTT(text) {
		ipcRenderer.send('simulate-stt', text);
	}
	
	changeHotword(value) {
		let hotword = value;
		let hotwordEnabled = true;
		if (value === 'OFF') {
			hotwordEnabled = false;
		}
		this.setState({
			hotword,
			hotwordEnabled
		});
		ipcRenderer.send('hotword-select', hotword);
	}
	
	showSettings() {
		if (this.state.mode === 'intro-tutorial') {
			return;
		}
	}
	
	toggleRecording() {
		if (this.state.recording) this.stopRecording()
		else this.startRecording();
	}
	
	startRecording() {
		if (!this.state.config.deepspeechInstalled) {
			this.showInstall(true);
			return;
		}
		if (!this.state.recording) {
			if (this.state.useSystemMic) {
				ipcRenderer.send('recording-start');
			}
			this.setState({
				recording: true
			}, () => {
				this.microphone.start();
			});
		}
		this.events.emit('recording-started');
	};
	
	stopRecording() {
		if (!this.state.config.deepspeechInstalled) {
			return;
		}
		
		if (this.state.recording) {
			if (this.state.useSystemMic) {
				ipcRenderer.send('recording-stop');
			}
			clearInterval(this.recordingInterval);
			this.setState({
				recording: false
			}, () => {
				this.microphone.stop();
				// setTimeout(() => {
				this.analyser.stop();
				clearVADCanvas(this.vadStatusRef.current);
					
				// },1000);
			});
		}
		this.events.emit('recording-stopped');
	};
	
	setMuted(muted) {
		this.setState({
			muted
		});
		this.microphone.setMuted(muted);
		if (this.state.useSystemMic) {
			ipcRenderer.send('microphone-muted', muted);
		}
	}
	
	toggleMute() {
		this.setMuted(!this.state.muted);
	};
	
	clearOutput() {
		this.setState({recognitionOutput:[]});
	}
}

export default App;
