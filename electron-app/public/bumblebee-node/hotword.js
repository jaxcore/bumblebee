// const BumblebeeHotword = require('bumblebee-hotword-node');
// const ipcMain = require('electron').ipcMain;
//
// module.exports = function connecthotword(bumblebee, bumblebeeElectron) {
//
// 	const hotword = new BumblebeeHotword();
// 	hotword.setSensitivity(0.9);
//
// 	hotword.addHotword('bumblebee');
// 	hotword.addHotword('grasshopper');
// 	hotword.addHotword('hey_edison');
// 	hotword.addHotword('porcupine');
// 	hotword.addHotword('terminator');
//
// 	hotword.on('ready', function () {
// 		console.log('BUMBLEBEE READY');
// 	});
//	
// 	ipcMain.on('microphone-muted', (event, muted) => {
// 		console.log('bumblebee.setMuted', muted)
// 		hotword.setMuted(muted);
// 	});
//
// 	ipcMain.on('recording-start', (event) => {
// 		console.log('recording-start');
// 		debugger;
// 		bumblebeeElectron.setState({recording: true});
// 		bumblebee.playSound('on').then(() => {
// 			console.log('recording-start on DONE');
// 		});
// 		hotword.start();
// 	});
//
// 	ipcMain.on('recording-stop', (event) => {
// 		bumblebeeElectron.setState({recording: false});
// 		bumblebee.playSound('off').then(() => {
// 			console.log('recording-start on DONE');
// 		});
// 		hotword.stop();
// 	});
//
// 	return hotword;
// }
