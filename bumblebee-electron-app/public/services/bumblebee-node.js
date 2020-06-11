const BumblebeeNode = require('bumblebee-hotword-node');

const bumblebee = new BumblebeeNode();
bumblebee.setSensitivity(0.9);

bumblebee.addHotword('bumblebee');
bumblebee.addHotword('grasshopper');
bumblebee.addHotword('hey_edison');
bumblebee.addHotword('porcupine');
bumblebee.addHotword('terminator');

bumblebee.on('ready', function () {
	console.log('BUMBLEBEE READY');
});

// bumblebee.on('end', function () {
// 	console.log('end');
// });

// bumblebee.start({
// 	record: false
// });


module.exports = bumblebee;