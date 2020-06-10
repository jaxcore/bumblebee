const BumbleBee = require('bumblebee-hotword-node');

const bumblebee = new BumbleBee();
bumblebee.setSensitivity(0.9);

bumblebee.addHotword('bumblebee');
bumblebee.addHotword('grasshopper');
bumblebee.addHotword('hey_edison');
bumblebee.addHotword('porcupine');
bumblebee.addHotword('terminator');

// bumblebee.setHotword('terminator');

// bumblebee.addHotword('white_smoke', require('./white_smoke.js'));

bumblebee.on('ready', function () {
	console.log('BUMBLEBEE READY')
});

// bumblebee.on('hotword', function (hotword) {
// 	console.log('');
// 	console.log('Hotword Detected:', hotword);
// });

bumblebee.on('end', function () {
	console.log('end');
});

// bumblebee.start({
// 	record: false
// });

//
// setTimeout(function() {
// 	console.log('RESET HOTWORD -------------------------')
// 	console.log('RESET HOTWORD -------------------------')
// 	console.log('RESET HOTWORD -------------------------')
// 	console.log('RESET HOTWORD -------------------------')
// 	console.log('RESET HOTWORD -------------------------')
// 	console.log('RESET HOTWORD -------------------------')
// 	bumblebee.stop();
//
// 	// bumblebee.setHotword('hey_edison');
//
// 	bumblebee.once('ready', function() {
// 		console.log('read HOTWORD ')
// 	});
//
// 	bumblebee.start({
// 		record: false
// 	});
//
//
// },15000);

bumblebee.emitRaw = true;

module.exports = bumblebee;