import EventEmitter from "events";
import SpectrumAnalyser from "./audio-spectrum-analyser";

const ipcRenderer = window.ipcRenderer;

const colors = {
	alarm: 'purple',
	cancel: 'orange',
	click: 'green',
	deny: 'red',
	down: '#77f',
	error: 'red',
	hail: 'green',
	off: '#f7f',
	okay: '#44f',
	on: '#7ff',
	up: '#f77',
	warn: 'yellow'
};

const themes = {
	startrek1: {
		alarm: new Audio('sounds/startrek1/alarm.wav'),
		cancel: new Audio('sounds/startrek1/cancel.wav'),
		click: new Audio('sounds/startrek1/click.wav'),
		deny: new Audio('sounds/startrek1/deny.wav'),
		down: new Audio('sounds/startrek1/down.wav'),
		error: new Audio('sounds/startrek1/error.wav'),
		hail: new Audio('sounds/startrek1/hail.wav'),
		okay: new Audio('sounds/startrek1/okay.wav'),
		off: new Audio('sounds/startrek1/off.wav'),
		on: new Audio('sounds/startrek1/on.wav'),
		up: new Audio('sounds/startrek1/up.wav'),
		warn: new Audio('sounds/startrek1/warn.wav')
	}
};

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
			
			const gainNode = audioContext.createGain();
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
			// debugger;
			reject();
		});
	});
}

class SayQueue extends EventEmitter {
	constructor(app) {
		super();
		this._audio = [];
		this.volume = 1;
		this.playing = false;
		this.sayOscilloscopeRef = null;
		this.profile = null;
		this.app = app;
	}

	setProfile(profile) {
		this.profile = profile;
	}
	setVolume(v) {
		this.volume = v;
	}

	queue(text, options, data, onBegin, onEnd, callback) {
		if (!options) options = {};
		this._audio.push({
			text, options, data, onBegin, onEnd, callback
		});
		if (this.playing) {
			console.log('queue is already playing');
		}
		if (!this.playing) {
			// debugger;
			console.log('queue playNext');
			this.playNext();
		}
	}

	play(text, options, data) {
		this.emit('play', text, options, data);
		const getAnalyzer = (analyser) => {
			const canvas = this.app.sayOscilloscopeRef.current;
			canvas.width = window.innerWidth;
			canvas.height = 100;
			this.analyser = new SpectrumAnalyser(analyser, canvas);
			this.analyser.setLineColor(this.app.theme.colors.ttsColor);
			this.analyser.setBackgroundColor('#222');
			this.analyser.start();
		};
		return playAudio(data, this.volume, getAnalyzer);
		// .then(() => {
		// playAudio(data, this.volume, getAnalyzer).then(() => {
		// 	if (callback) callback();
		// 	this.playNext();
		// })
	}

	playNext() {
		// if (this.playing) {
		// 	debugger;
		// 	return;
		// }
		const bumblebee = this.app.bumblebee;
		let currAudio = this._audio.shift();
		console.log('playNext', currAudio);
		
		if (currAudio) {
			if (!this.playing) {
				this.playing = true;
				this.emit('playing');
			}

			this.emit('say-begin', currAudio);
			if (currAudio.onBegin) currAudio.onBegin();
			
			if (typeof currAudio.options.sound === 'object') {
				
				const name = currAudio.options.sound.name;
				let theme = currAudio.options.sound.theme;
				if (!theme) theme = 'startrek1';
				
				console.log('playNext sound', name, theme);
				
				if (themes[theme] && themes[theme][name]) {
					let color;
					
					if (bumblebee.analyser) {
						color = colors[name];
						console.log('color', color);
						bumblebee.analyser.setLineColor(color);
					}
					else {
						debugger;
					}
					
					themes[theme][name].onended = () => {
						// debugger;
						this.app.setState({
							soundPlaying : false
						}, () => {
							if (currAudio.onEnd) currAudio.onEnd();
							this.emit('say-end', currAudio);
							this.app.updateBanner();
							// debugger;
							currAudio.callback();
							this.playNext();
						});
						// resolve(true);
					};
					
					this.app.setState({
						soundPlaying : true,
						soundPlayingColor : color
					}, () => {
						this.app.updateBanner();
						
						if (themes[theme][name]) {
							themes[theme][name].play();
						}
						else {
							debugger;
						}
					});
				}
				else {
					debugger;
				}
				
				// this.app.bumblebee._playSound(currAudio.options.sound.name, currAudio.options.theme).then(() => {
				// 	this.emit('say-end', currAudio);
				// 	if (currAudio.onEnd) currAudio.onEnd();
				// 	console.log('currAudio.callback', currAudio.callback);
				// 	debugger;
				// 	currAudio.callback();
				// });
			}
			else {
				this.play(currAudio.text, currAudio.options, currAudio.data).then(() => {
					if (currAudio.onEnd) currAudio.onEnd();
					this.emit('say-end', currAudio);
					this.app.updateBanner();
					currAudio.callback();
					this.playNext();
				});
			}
		}
		else {
			// debugger;
			this.playing = false;
			this.emit('stopped');
		}
	}
	
	
	// playSound(name, theme, callback) {
	// 	this.emit('play-sound', name, theme);
	// 	this.app.bumblebee.playSound(name, theme).then(() => {
	// 		if (callback) callback();
	// 		this.playNext();
	// 	})
	// }
	
	playSound(name, theme, onBegin, onEnd) {
		console.log('sayQueue playSound', name, theme, typeof onBegin, typeof onEnd);
		if (!theme) theme = 'startrek1';
		return new Promise((resolve, reject) => {
			const options = {
				sound: {
					name,
					theme
				}
			};
			this.queue(null, options, null, onBegin, onEnd, resolve);
		});
	};
	
	say(text, options, onBegin, onEnd) {
		if (!options) options = {};
		return new Promise((resolve, reject) => {
			ipcRenderer.invoke('say-data', text, options).then((data) => {
				this.queue(text, options, data, onBegin, onEnd, resolve);
			});
		});
	};
}


const connectSayQueue = function(bumblebee, app) {
	const sayQueue = new SayQueue(app);
	
	window.saySound = (name, theme, id) => {
		if (!theme) theme = 'startrek1';
		if (themes[theme] && themes[theme][name]) {
			debugger;
			bumblebee.playSound(name, theme, function () {
				// debugger;
				console.log('ipcRenderer EMIT say-begin-' + id)
				ipcRenderer.send('say-begin-' + id);
			}, function () {
				console.log('ipcRenderer EMIT say-end-' + id)
				ipcRenderer.send('say-end-' + id);
			});
			return id;
		}
	};
	
	window.say = (text, options) => {
		const id = Math.random().toString().substring(2);
		bumblebee.say(text, options, function() {
			ipcRenderer.send('say-begin-'+id);
		}, function() {
			ipcRenderer.send('say-end-'+id);
		});
		return id;
	};

	sayQueue.sayOscilloscopeRef = bumblebee.sayOscilloscopeRef;

	sayQueue.on('say-begin', (utterance) => {
		if (utterance.options.consoleOutput === false) return;
		if (utterance.options.sound) {
			// bumblebee.console('sound');
		}
		else {
			bumblebee.console({
				type: 'tts',
				text: utterance.text,
				options: utterance.options
			});
		}
		
	});
	
	sayQueue.setVolume(app.state.sayVolume);
	
	sayQueue.on('playing', () => {
		bumblebee.setMuted(true);
		app.setState({
			sayPlaying: true,
		}, () => {
			app.updateBanner();
		});
	});
	
	sayQueue.on('stopped', () => {
		bumblebee.setMuted(false);
		app.setState({
			sayPlaying: false,
		}, () => {
			app.updateBanner();
		});
	});
	
	return sayQueue;
}

export { connectSayQueue };

