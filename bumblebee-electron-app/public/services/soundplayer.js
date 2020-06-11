var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');

module.exports = function playSound(file) {
	var reader = new wav.Reader();
	var file = fs.createReadStream(file+'.wav');
	reader.on('format', function (format) {
		// the WAVE header is stripped from the output of the reader
		reader.pipe(new Speaker(format));
	});
	file.pipe(reader);
}