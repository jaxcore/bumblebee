const BumblebeeHotword = require('bumblebee-hotword-node');
const ipcMain = require('electron').ipcMain;

module.exports = function connecthotword(bumblebee, bumblebeeElectron) {
	
	const hotword = new BumblebeeHotword();
	hotword.setSensitivity(0.9);
	
	hotword.addHotword('bumblebee');
	hotword.addHotword('grasshopper');
	hotword.addHotword('hey_edison');
	hotword.addHotword('porcupine');
	hotword.addHotword('terminator');
	
	hotword.on('ready', function () {
		console.log('BUMBLEBEE READY');
	});
	
	ipcMain.on('hotword-select', (event, hotword) => {
		if (hotword === 'OFF') {
			hotword = null;
			hotword.setEnabled(false);
		}
		else {
			if (hotword === 'ANY') {
				hotword = null;
			}
			hotword.setEnabled(true);
		}
		hotword.setHotword(hotword);
	});
	
	hotword.on('hotword', function (hotword) {
		console.log('');
		console.log('Hotword Detected:', hotword);
		let functionName = 'hotwordDetected';
		let args = [hotword];
		bumblebeeElectron.execFunction(functionName, args, function () {
			console.log('hotwordDetected code complete');
		});
	});
	
	ipcMain.on('microphone-muted', (event, muted) => {
		console.log('bumblebee.setMuted', muted)
		hotword.setMuted(muted);
	});
	
	ipcMain.on('recording-start', (event) => {
		bumblebeeElectron.setState({recording: true});
		bumblebee.playSound('on').then(() => {
			console.log('recording-start on DONE');
		});
		hotword.start();
	});
	ipcMain.on('recording-stop', (event) => {
		bumblebeeElectron.setState({recording: false});
		bumblebee.playSound('off').then(() => {
			console.log('recording-start on DONE');
		});
		hotword.stop();
	});
	
	return hotword;
}
