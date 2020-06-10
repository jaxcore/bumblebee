import React, {Component} from 'react';
import BumbleBee, {SpectrumAnalyser} from 'bumblebee-hotword';

const ipcRenderer = window.ipcRenderer;

let bumblebee = new BumbleBee();
bumblebee.setWorkersPath('./bumblebee-workers');
bumblebee.addHotword('bumblebee');
// bumblebee.addHotword('grasshopper');
// bumblebee.addHotword('hey_edison');
// bumblebee.addHotword('porcupine');
// bumblebee.addHotword('terminator');
// bumblebee.setHotword('bumblebee');

window.deepspeechResults = function () {};

class JaxcoreDeepSpeechElectronApp extends Component {
	constructor() {
		super();
		this.state = {
			started: false,
			output: []
		};
	}
	
	componentDidMount() {
		// ensure electron IPC is working:
		setTimeout(() => {
			console.log('send client-ready');
			window.ipcRenderer.send('client-ready');
		}, 1);
		ipcRenderer.on('electron-ready', () => {
			console.log('electron ready');
			this.start();
		});
		
		// receive speech recognition result by a synchronous message from public/electron.js
		window.deepspeechResults = (text, stats) => {
			console.log('deepspeech results', text, stats);
			// debugger;
			const {output} = this.state;
			output.unshift({
				text
			});
			this.setState({output});
		};
	}
	
	start() {
		bumblebee.on('hotword', (hotword) => {
			console.log('hotword', hotword);
			const {output} = this.state;
			output.unshift({
				hotword
			});
			this.setState({output});
		});
		
		bumblebee.on('data', (data, sampleRate) => {
			// stream microphone audio to electron, which streams it to jaxcore-deepspeech-plugin, see public/electron.js
			ipcRenderer.send('stream-data', data, sampleRate);
		});
		
		bumblebee.on('analyser', (analyser) => {
			console.log('analyser', analyser);
			var canvas = document.getElementById('oscilloscope');
			this.analyser = new SpectrumAnalyser(analyser, canvas);
			this.analyser.setLineColor('#fff');
			this.analyser.setBackgroundColor('#222');
			this.analyser.start();
		});
		
		bumblebee.start();
		
		this.setState({started: true});
	}
	
	render() {
		if (!this.state.started) {
			return 'loading...';
		}
		return (<div className="App">
			<h3>DeepSpeech Electron Example</h3>
			
			<div>
				Active Hotwords: "bumblebee", "grasshopper", "hey edison", "porcupine", "terminator"
			</div>
			
			<div>
				<canvas id="oscilloscope" width="480" height="100"/>
			</div>
			
			<ul>
				{
					this.state.output.map((line, id) => {
						return this.renderOutputLine(line, id)
					})
				}
			</ul>
		</div>);
	}
	
	renderOutputLine(line, id) {
		if (line.hotword) {
			return (<li key={id}><strong>HOTWORD:</strong> {line.hotword}</li>);
		}
		else {
			return (<li key={id}><strong>SPEECH:</strong> {line.text}</li>);
		}
	}
}

export default JaxcoreDeepSpeechElectronApp;