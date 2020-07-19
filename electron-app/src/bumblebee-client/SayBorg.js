import async from 'async';
const ipcRenderer = window.ipcRenderer;

function getAudioData(text, options, callback) {
	ipcRenderer.invoke('say-data', text, options).then(callback);
}

export default function borgGetAudioData(text, options, callback) {
	text += '.....'; // add some silence to the end
	let voices = [];
	
	let lang = (options && options.language)? options.language : 'en-us';
	
	let audioContext = new window.AudioContext();
	
	voices.push((callback) => {
		getAudioData(text, {
			profile: 'Jack',
			language: lang,
			speed: 160,
			pitch: 1
		}, function (data) {
			audioContext.decodeAudioData(data, (buffer) => {
				callback(null, [data, buffer]);
			});
		})
	});
	
	voices.push((callback) => {
		getAudioData(text, {
			profile: 'Jack',
			language: lang,
			speed: 160,
			pitch: 40
		}, function (data) {
			audioContext.decodeAudioData(data, (buffer) => {
				callback(null, [data, buffer]);
			});
		})
	});
	
	voices.push((callback) => {
		getAudioData(text, {
			profile: 'Roy',
			language: lang,
			speed: 160,
			pitch: 30
		}, function (data) {
			audioContext.decodeAudioData(data, (buffer) => {
				callback(null, [data, buffer]);
			});
		});
	});
	
	voices.push((callback) => {
		getAudioData(text, {
			profile: 'Roy',
			language: lang,
			speed: 160,
			pitch: 30
		}, function (data) {
			audioContext.decodeAudioData(data, (buffer) => {
				callback(null, [data, buffer]);
			});
		});
	});
	
	voices.push((callback) => {
		getAudioData(text, {
			profile: 'Leon',
			language: lang,
			speed: 160,
			pitch: 20
		}, function (data) {
			audioContext.decodeAudioData(data, (buffer) => {
				callback(null, [data, buffer]);
			});
		})
	});
	
	voices.push((callback) => {
		getAudioData(text, {
			profile: 'Xenu',
			language: lang,
			speed: 166,
			pitch: 5
		}, function (data) {
			audioContext.decodeAudioData(data, (buffer) => {
				callback(null, [data, buffer]);
			});
		});
	});
	
	async.parallel(voices, function (err, results) {
		if (results) {
			let maxLength = 0;
			let maxDuration = 0;
			let sampleRate = 0;
			results.forEach(function (result) {
				let buffer = result[1];
				maxLength = Math.max(maxLength, buffer.length);
				maxDuration = Math.max(maxDuration, buffer.duration);
				sampleRate = buffer.sampleRate;
			});
			
			let audioContext = new window.AudioContext();
			let audioBuffer = audioContext.createBuffer(2, sampleRate * maxDuration, sampleRate);
			
			let channgelToggle = false;
			results.forEach(function (result) {
				let buffer = result[1];
				
				if (channgelToggle) {
					let leftInBuffer = buffer.getChannelData(0);
					let leftOutBuffer = audioBuffer.getChannelData(0);
					
					for (let i = 0; i < maxLength; i++) {
						if (i > leftOutBuffer.length) leftOutBuffer[i] = 0;
						leftOutBuffer[i] += leftInBuffer[i];
					}
				}
				else {
					let rightInBuffer = buffer.getChannelData(0);
					let rightOutBuffer = audioBuffer.getChannelData(1);
					
					for (let i = 0; i < maxLength; i++) {
						if (i > rightInBuffer.length) rightOutBuffer[i] = 0;
						else rightOutBuffer[i] += rightInBuffer[i];
					}
				}
				
				channgelToggle = !channgelToggle;
			});
			
			let source = audioContext.createBufferSource();
			source.buffer = audioBuffer;
			
			callback(audioContext, source);
		}
	});
}