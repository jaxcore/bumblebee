// var fs = require('fs');
// var wav = require('wav');
// var Speaker = require('speaker');

// const playSoundFile = require('bumblebee-api/server/playSoundFile');

module.exports = async function playsound(path, volume) {
	// if (typeof volume === 'undefined' || volume === 1) {
	// 	return new Promise((resolve, reject) => {
	// 		try {
	// 			const file = fs.createReadStream(path);
	// 			const reader = new wav.Reader();
	// 			reader.on('format', function (format) {
	// 				// the WAVE header is stripped from the output of the reader
	// 				const speaker = new Speaker(format);
	// 				speaker.on('close', function () {
	// 					resolve();
	// 				});
	// 				reader.pipe(speaker);
	// 			});
	// 			file.pipe(reader);
	// 		}
	// 		catch(e) {
	// 			reject(e);
	// 		}
	// 	});
	// }
	// else {
	//
	// }
}