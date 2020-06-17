var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');

module.exports = async function playsound(path, volume, cache, override) {
	if (typeof volume === 'undefined' || volume === 1) {
		return new Promise((resolve, reject) => {
			try {
				const file = fs.createReadStream(path);
				const reader = new wav.Reader();
				reader.on('format', function (format) {
					// the WAVE header is stripped from the output of the reader
					const speaker = new Speaker(format);
					speaker.on('close', function () {
						resolve();
					});
					reader.pipe(speaker);
				});
				file.pipe(reader);
			}
			catch(e) {
				reject(e);
			}
		});
	}
	else {
	
	}
}

// function playWithVolume(data, volume, options, callback) {
// 	const speaker = new Speaker(options);
//
// 	let stream = new Duplex();
// 	stream.push(data);
// 	stream.push(null);
//
// 	speaker.on('close', function () {
// 		callback();
// 	});
//
// 	if (volume < 1) {
// 		const volumeStream = new Volume();
// 		volumeStream.setVolume(volume);
// 		volumeStream.pipe(speaker);
// 		stream.pipe(volumeStream);
// 	}
// 	else {
// 		stream.pipe(speaker);
// 	}
//
// 	stream.destroy();
// }