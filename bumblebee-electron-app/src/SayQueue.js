import EventEmitter from "events";
import {SpectrumAnalyser} from "bumblebee-hotword";

const ipcRenderer = window.ipcRenderer;

function getAudioContext() {
	let audioContext;
	if (window.AudioContext) {
		audioContext = new window.AudioContext();
	}
	else if (window.webkitAudioContext) {
		console.log('creating webkitAudioContext');
		audioContext = new window.webkitAudioContext();
	}
	else {
		throw new Error('no AudioContext');
		return;
	}
	return audioContext;
}

function playAudio(data, volume, analyzerCallback) {
	if (!volume) {
		return new Promise((resolve, reject) => {
			resolve();
		});
	}
	return new Promise((resolve, reject) => {
		let audioContext = getAudioContext();
		let source = audioContext.createBufferSource();
		audioContext.decodeAudioData(data, (buffer) => {
			source.buffer = buffer;
			
			var gainNode = audioContext.createGain();
			gainNode.gain.setValueAtTime(volume, 0);
			// gainNode.gain.setValueAtTime(1, audioBuffer.duration-0.5);
			// gainNode.gain.linearRampToValueAtTime(0.0001, audioBuffer.duration - 0.2);
			source.connect(gainNode);
			gainNode.connect(audioContext.destination);
			
			const audioAnalyser = audioContext.createAnalyser();
			gainNode.connect(audioAnalyser);
			
			if (analyzerCallback) analyzerCallback(audioAnalyser);
			
			source.onended = function () {
				audioContext.close();
				resolve();
			};
			source.start(0);
		}, function (e) {
			console.log('error', e);
			debugger;
			reject();
		});
	});
}

class SayQueue extends EventEmitter {
	constructor() {
		super();
		this._audio = [];
		this.volume = 1;
		this.playing = false;
		this.lineColor = '#fff';
		this.sayOscilloscopeRef = null;
		this.profile = null;
	}
	
	setProfile(profile) {
		this.profile = profile;
	}
	setVolume(v) {
		this.volume = v;
	}
	
	queue(text, options, data, onBegin, onEnd, callback) {
		if (!options) options = {};
		if (!options.profile && this.profile) {
			// options.profile = this.profile;
			// debugger;
		}
		this._audio.push({
			text, options, data, onBegin, onEnd, callback
		});
		if (!this.playing) {
			this.playNext();
		}
	}
	
	play(text, options, data, callback) {
		this.emit('play', text, options, data);
		const getAnalyzer = (analyser) => {
			if (this.sayOscilloscopeRef) {
				var canvas = this.sayOscilloscopeRef.current;
				canvas.width = window.innerWidth;
				canvas.height = 100;
				this.analyser = new SpectrumAnalyser(analyser, canvas);
				this.analyser.setLineColor(this.lineColor);
				this.analyser.setBackgroundColor('#222');
				this.analyser.start();
			}
		};
		
		playAudio(data, this.volume, getAnalyzer).then(() => {
			if (callback) callback();
			this.playNext();
		})
	}
	
	playNext() {
		let nextAudio = this._audio.shift();
		if (nextAudio) {
			if (!this.playing) {
				this.playing = true;
				this.emit('playing');
			}
			
			this.emit('say-begin', nextAudio);
			if (nextAudio.onBegin) nextAudio.onBegin();
			
			// if (nextAudio.options.console) {
			// 	this.emit('console', nextAudio.options.console);
			// }
			
			this.play(nextAudio.text, nextAudio.options, nextAudio.data, () => {
				this.emit('say-end', nextAudio);
				if (nextAudio.onEnd) nextAudio.onEnd();
				nextAudio.callback();
			});
		}
		else {
			this.playing = false;
			this.emit('stopped');
		}
	}
}

const sayQueue = new SayQueue();

async function say(text, options, onBegin, onEnd) {
	if (options && options.profile) {
		// debugger;
	}
	if (!options) options = {};
	return new Promise((resolve, reject) => {
		
		const sayOptions = {
			profile: options.profile
		}
		if (!sayOptions.profile && sayQueue.profile) sayOptions.profile = sayQueue.profile;
		
		// if ('console' in options) delete options.console;
		
		ipcRenderer.invoke('say-data', text, sayOptions).then((data) => {
			sayQueue.queue(text, options, data, onBegin, onEnd, resolve);
		});
	});
}

// const say = function(text, options) {
// 	return new Promise((resolve, reject) => {
// 		ipcRenderer.invoke('say-data', text, options).then((data) => {
// 			sayQueue.queue(text, options, data, resolve);
// 		});
// 	});
// };


export { say };
export { sayQueue };