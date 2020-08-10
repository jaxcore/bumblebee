/*
    Bumblebee - JavaScript Voice Application Platform
    Copyright (C) 2020 Jaxcore Software Inc.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, {Component} from 'react';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import SettingsIcon from '@material-ui/icons/Settings';
import InstallDialog from './install/InstallDialog';
import BumblebeeClient from './bumblebee-client/BumblebeeClient';
import ConsoleOutput from './console/ConsoleOutput';
import _console from './console/console';

import themes from './themes';

const ipcRenderer = window.ipcRenderer;

const inputModePlaceholders = {
	stt: "speech to text",
	tts: "text to speech",
	hot: "hotword commands"
};

class App extends Component {
	constructor(props) {
		super(props);
		
		this.themes = themes;
		this.theme = this.themes['mainmenu'];
		
		this.state = {
			connected: false,
			recording: false,
			muted: false,
			soundPlaying: false,
			soundTheme: 'startrek1',
			microphoneVolume: 1,
			sayVolume: 1,
			recognitionOutput: [],
			logo: this.theme.images.default,
			controlsVisible: false,
			useSystemMic: true,
			showInstallDialog: false,
			inputMode: 'stt',
			config: {},
			appDisplay: {},
			sayPlaying: false,
			activeAssistant: null,
			activeAssistantsApp: null
		};
		
		this.console = _console.bind(this);
		
		this.speechOscilloscopeRef = React.createRef();
		this.sayOscilloscopeRef = React.createRef();
		this.vadStatusRef = React.createRef();
		this.contentRef = React.createRef();
		this.consoleInputRef = React.createRef();
		this.contentPanelRef = React.createRef();
		
		window.app = this;
	}
	
	updateBanner() {
		const isSayPlaying = this.state.sayPlaying;
		const isDisabled = !this.state.recording;
		let logo, appTextColor;
		let theme;
		
		if (this.state.config.activeAssistant) {
			theme = this.state.config.activeAssistant;
			this.theme = this.themes[theme];
			
			if (isDisabled) {
				logo = this.theme.images.default;
			}
			else {
				if (isSayPlaying) {
					logo = this.theme.images.speaking;
				}
				else {
					logo = this.theme.images.hotword;
				}
			}
		}
		else {
			theme = 'mainmenu';
			this.theme = this.themes[theme];
			logo = this.theme.images.default;
		}
		
		this.setState({
			logo,
			theme
		}, () => {
			if (this.bumblebee.analyser) {
				if (this.state.soundPlaying && this.state.soundPlayingColor) {
					this.bumblebee.analyser.setLineColor(this.state.soundPlayingColor);
				}
				else this.bumblebee.analyser.setLineColor(this.theme.colors.sttColor);
			}
		});
	}
	
	resize() {
		let contentPanelRef = this.contentPanelRef.current;
		if (contentPanelRef) {
			let h = (window.innerHeight - 151);
			contentPanelRef.style.height = h + 'px';
		}
	}
	
	componentDidMount() {
		window.addEventListener('resize', e => this.resize());
		this.resize();
		
		ipcRenderer.on('electron-ready', (event, config) => {
			this.setElectronConfig(config);
			this.bumblebee = new BumblebeeClient(this);
			if (this.state.config.deepspeechInstalled) {
				this.startServer();
			}
			else {
				// this.bumblebee.say('Welcome to Bumblebee')
				// .then(() => {
				// 	return this.bumblebee.say('It looks like you don\'t have DeepSpeech installed');
				// })
				// .then(() => {
				// 	return this.bumblebee.say('Let\'s install it now');
				// })
				// .then(() => {
				// 	this.showInstall(true);
				// });
				this.showInstall(true);
			}
		});
		ipcRenderer.send('client-ready');
	}
	
	setElectronConfig(config) {
		this.setState({
			connected: true,
			config
		});
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
		this.startServer().then(() => {
			ipcRenderer.send('start-bumblebee-intro');
		});
	}
	
	async startServer() {
		const response = await ipcRenderer.invoke('bumblebee-start-server');
		if (response === true) {
			this.bumblebee.startRecording();
			return true;
		}
		else {
			throw response;
		}
	}
	
	showInstall(show) {
		this.setState({
			showInstallDialog: show
		});
	}
	
	render() {
		const sayClass = this.state.sayPlaying ? 'visible' : 'hidden';
		const Mic = this.state.recording ? MicIcon : MicOffIcon;
		let logoImage;
		if (this.state.logo) logoImage = (<img src={this.state.logo}/>);
		
		return (<div className="App">
			{this.state.showInstallDialog ? (<InstallDialog onInstalled={() => this.deepspeechInstalled()}
															onCancel={() => this.showInstall(false)}/>) : null}
			
			<div id="header">
				<div id="banner">
					<canvas id="vad-status" ref={this.vadStatusRef} width="10" height="9"/>
					
					<canvas id="speech-oscilloscope" className="oscilloscope" ref={this.speechOscilloscopeRef}/>
					<canvas id="say-oscilloscope" className={"oscilloscope " + sayClass} ref={this.sayOscilloscopeRef}/>
					
					<div id="logo" onClick={e => this.clickLogo()}>
						{logoImage}
					</div>
					
					<div id="mic-icon" className="banner-icon" onClick={e => this.bumblebee.toggleRecording()}>
						<Mic/>
						<div className="text">Mic {this.state.recording ? 'On' : 'Off'}</div>
					</div>
					
					<div id="settings-icon" className="banner-icon" onClick={e => this.showSettings()}>
						<SettingsIcon/>
						<div className="text">Settings</div>
					</div>
				</div>
			</div>
			
			{this.renderAppBar()}
			
			<div className="container">
				{this.renderContent()}
				{this.renderConsoleInput()}
			</div>
		</div>);
	}
	
	renderAppBar() {
		let name;
		const hotword = this.state.config.activeAssistant;

		if (hotword && this.state.config.assistants) {
			const assistantName = this.state.config.assistants[hotword].name;
			if (this.state.config.activeApplications[hotword] && this.state.config.applications[hotword]) {
				let appId = this.state.config.activeApplications[hotword].appId;
				if (appId in this.state.config.applications[hotword]) {
					let appName = this.state.config.applications[hotword][appId].name;
					name = appName;
				}
				else name = assistantName;
			}
			else name = assistantName;
		}
		else name = 'Main Menu';
		
		return (<div id="app-bar">
			{name}
		</div>);
	}
	
	clickLogo() {
		debugger;
		ipcRenderer.send('click-logo');
	}
	
	renderContent() {
		return (<div className="content" ref={this.contentRef}>
			<div className="content-panel" ref={this.contentPanelRef}>
				{this.renderRecognitionOutput()}
			</div>
		</div>);
	}
	
	renderConsoleInput() {
		return (<div id="console-input">
			<select onChange={e => this.changeInputMode(e.target.options[e.target.selectedIndex].value)}
					value={this.state.inputMode}>
				<option value="stt">STT</option>
				<option value="tts">TTS</option>
				<option value="hot">HOT</option>
			</select>
			
			<input type="text" ref={this.consoleInputRef} placeholder={inputModePlaceholders[this.state.inputMode]}
				   onKeyPress={this.keypressConsoleInput}/>
			
			<button onClick={e => this.executeConsoleInput()}>
				Execute
			</button>
			
			<button onClick={e => this.bumblebee.clearConsole()}>
				Clear
			</button>
		</div>);
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
	
	setConsoleInputText(t) {
		this.consoleInputRef.current.value = t;
	}
	executeConsoleInput() {
		let text = this.consoleInputRef.current.value;
		console.log('executeConsoleInput', this.state.inputMode, text);
		if (this.state.inputMode === 'stt') {
			this.bumblebee.simulateSTT(text);
		}
		if (this.state.inputMode === 'tts') {
			this.bumblebee.simulateTTS(text);
		}
		if (this.state.inputMode === 'hot') {
			this.bumblebee.simulateHotword(text);
		}
	}
	
	showSettings() {
		this.bumblebee.simulateHotword('bumblebee settings');
	}
	
	addSpeechOutput(data) {
		const {recognitionOutput} = this.state;
		data.activeAssistant = this.bumblebee.activeAssistant;
		data.activeAssistantsApp = this.bumblebee.activeAssistantsApp;
		recognitionOutput.push(data);
		this.setState({recognitionOutput}, () => {
			this.contentPanelRef.current.scroll(0,100000000000000)
		});
	}
	renderRecognitionOutput() {
		return (<ConsoleOutput bumblebee={this.bumblebee} recognitionOutput={this.state.recognitionOutput}/>);
	}
}

export default App;
