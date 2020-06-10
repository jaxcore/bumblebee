import React, {Component} from 'react';
import Microphone from './Microphone';
import {SpectrumAnalyser} from 'bumblebee-hotword';
import SayQueue from './SayQueue';
// import Say from 'jaxcore-say';


import drawVADCanvas from './drawVADCanvas';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import SettingsIcon from '@material-ui/icons/Settings';

const ipcRenderer = window.ipcRenderer;

const sayQueue = new SayQueue();

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
			useSystemMic: true
		};
		
		this.speechOscilloscopeRef = React.createRef();
		this.sayOscilloscopeRef = React.createRef();
		this.vadStatusRef = React.createRef();
		this.ttsInputRef = React.createRef();
		this.sttInputRef = React.createRef();
		this.hotInputRef = React.createRef();
		
		this.logos = {
			default: 'logo-autobots',
			hotword: 'logo-autobots-hotword',
			// speaking: 'logo-autobots-speaking',
			speaking: 'logo-autobots-speaking',
		}
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
		
		
		ipcRenderer.on('electron-ready', () => {
			console.log('electron ready');
			this.setState({connected: true});
			
			this.startRecording();
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
	
	
	
	addSpeechOutput(data) {
		const {recognitionOutput} = this.state;
		recognitionOutput.unshift(data);
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
					
					<div id="settings-icon" className="banner-icon" onClick={e => this.toggleSettings() }>
						<SettingsIcon />
						<div className="text">Settings</div>
					</div>
					
				</div>
			</div>
			
			{this.renderContent()}
			
		</div>);
	}
	
	toggleControls() {
		this.setState({
			controlsVisible: !this.state.controlsVisible
		});
	}
	
	simulateTTS() {
		let text = this.ttsInputRef.current.value;
		this.say(text);
	}
	
	simulateHotword() {
		this.setMuted(true);
		let text = this.hotInputRef.current.value;
		ipcRenderer.send('simulate-hotword', text, this.state.hotword);
		setTimeout(() => {
			this.setMuted(false);
		},1000);
	}
	
	simulateSTT() {
		let text = this.sttInputRef.current.value;
		ipcRenderer.send('simulate-stt', text);
	}
	
	say(text, options) {
		ipcRenderer.invoke('say-data', text, options).then((data) => {
			sayQueue.setVolume(this.state.sayVolume);
			sayQueue.queue(text, options, data);
		})
	}
	
	renderContent() {
		return (<div id="home" className="content">
			{this.renderControls()}
			{this.renderRecognitionOutput()}
		</div>)
	}
	renderControls() {
		const controlsClass = this.state.controlsVisible? 'block' : 'none';
		
		return (<div className={'controls '+controlsClass}>
			<input type="text" width="10" ref={this.ttsInputRef} placeholder="text to speech"/>
			<button onClick={e => this.simulateTTS()}>
				TTS
			</button>
			
			<br/>
			
			<input type="text" width="10" ref={this.sttInputRef} placeholder="speech to text"/>
			<button onClick={e => this.simulateSTT()}>
				STT
			</button>
			
			<br/>
			
			<input type="text" width="10" ref={this.hotInputRef} placeholder="hotword commands"/>
			<button onClick={e => this.simulateHotword()}>
				HOT
			</button>
			
			<br/>
			<br/>
			
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
			
			<button onClick={e => this.clearOutput()}>
				Clear Output
			</button>
			
			<button onClick={e => { ipcRenderer.send('dev-tools'); }}>
				Dev Console
			</button>
		
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
	};
	
	toggleSettings() {
	
	}
	
	toggleRecording() {
		if (this.state.recording) this.stopRecording()
		else this.startRecording();
	}
	
	startRecording() {
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
	};
	
	stopRecording() {
		if (this.state.recording) {
			if (this.state.useSystemMic) {
				ipcRenderer.send('recording-stop');
			}
			clearInterval(this.recordingInterval);
			this.setState({
				recording: false
			}, () => {
				this.microphone.stop();
			});
		}
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
