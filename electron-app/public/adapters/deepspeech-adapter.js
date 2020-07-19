const executeFunction = require('./executeFunction');

//
// ipcMain.on('hotword-select', (event, hotword) => {
// 	if (hotword === 'OFF') {
// 		hotword = null;
// 		bumblebee.setEnabled(false);
// 	}
// 	else {
// 		if (hotword === 'ANY') {
// 			hotword = null;
// 		}
// 		bumblebee.setEnabled(true);
// 	}
// 	bumblebee.setHotword(hotword);
// });
//
// bumblebee.on('hotword', function (hotword) {
// 	console.log('');
// 	console.log('Hotword Detected:', hotword);
// 	let functionName = 'hotwordDetected';
// 	let args = [hotword];
// 	executeFunction(mainWindow, functionName, args, function () {
// 		console.log('hotwordDetected code complete');
// 	});
// });

// bumblebee.on('data', function (intData, sampleRate, hotword, float32arr) {
// 	deepspeech.dualStreamData(intData, float32arr, 16000, hotword);
// });


// ipcMain.on('microphone-muted', (event, muted) => {
// 	console.log('bumblebee.setMuted', muted)
// 	bumblebee.setMuted(muted);
// });
//
// ipcMain.on('recording-start', (event) => {
// 	bumblebee.start();
// });
// ipcMain.on('recording-stop', (event) => {
// 	bumblebee.stop();
// });

//
// deepspeech.on('no-recognition', function (hotword) {
// 	if (hotword) {
// 		soundplayer('sounds/startrek1/off');
// 		let functionName = 'hotwordResults';
// 		let args = [hotword, null, null];
// 		executeFunction(mainWindow, functionName, args, function () {
// 			console.log('deepspeechResults code complete');
// 		});
// 	}
// });
//
//
// ipcMain.on('simulate-hotword', (event, text, hotword) => {
// 	if (hotword === 'ANY') hotword = 'bumblebee';
// 	else if (hotword === 'OFF') return;
//
// 	// bumblebee.emit('hotword', hotword);
//
// 	deepspeech.setState({hotword});
//
// 	setTimeout(function() {
// 		deepspeech.processRecognition(text, {
// 			recogTime: 0,
// 			audioLength: 0,
// 			model: deepspeech.state.modelName,
// 			hotword
// 		});
// 	},300);
//
// });
//
// ipcMain.on('simulate-stt', (event, text) => {
// 	deepspeech.processRecognition(text, {
// 		recogTime: 0,
// 		audioLength: 0,
// 		model: deepspeech.state.modelName
// 	});
// });
//
// deepspeech.on('vad', function (status) {
// 	// console.log('VAD', status);
// 	let functionName = 'updateVADStatus';
// 	let args = [status];
// 	executeFunction(mainWindow, functionName, args);
// });
//
// deepspeech.on('hotword', function (hotword, text, stats) {
// 	console.log('DS hotword:'+hotword, 'text='+text, stats);
// 	let functionName = 'hotwordResults';
// 	let args = [hotword, text, stats];
//
// 	soundplayer('sounds/startrek1/off');
//
// 	executeFunction(mainWindow, functionName, args);
// });
//
//
// deepspeech.on('recognize', function (text, stats) {
// 	console.log('DS recognize', text, stats);
// 	let functionName = 'deepspeechResults';
// 	let args = [text, stats];
// 	executeFunction(mainWindow, functionName, args);
// });

ipcMain.on('stream-data', (event, data, sampleRate) => {
	bumblebee.transcode(data, sampleRate, (deepspeechData, vadData, outputSampleRate, hotword) => {
		deepspeech.dualStreamData(deepspeechData, vadData, outputSampleRate, hotword);
	});
});