import EventEmitter from "events";
import {SpectrumAnalyser} from "bumblebee-hotword";

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
	}
	
	setVolume(v) {
		this.volume = v;
	}
	
	queue(text, options, data) {
		this._audio.push({
			text, options, data
		});
		if (!this.playing) {
			this.playNext();
			
		}
	}
	
	play(text, options, data) {
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
			this.emit('say', nextAudio.text, nextAudio.options, nextAudio.data);
			this.play(nextAudio.text, nextAudio.options, nextAudio.data);
		}
		else {
			this.playing = false;
			this.emit('stopped');
		}
	}
}

export default SayQueue;