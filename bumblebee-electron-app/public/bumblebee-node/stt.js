const ipcMain = require('electron').ipcMain;

module.exports = function connectSTT(bumblebee, app, deepspeech, bbHotword) {
	
	bbHotword.on('data', function (intData, sampleRate, hotword, float32arr) {
		// console.log('bb', typeof intData, sampleRate, hotword, float32arr);
		// deepspeech.dualStreamData(intData, float32arr, 16000, hotword);
		deepspeech.streamData(intData,16000, hotword, float32arr);
	});
	
	deepspeech.on('no-recognition', function (hotword) {
		if (hotword) {
			console.log('no-recognition', hotword);
			// bumblebee.playSound('cancel');
			
			// let functionName = 'hotwordResults';
			// let args = [hotword, null, null];
			// app.execFunction(functionName, args, function () {
			// 	console.log('deepspeechResults code complete');
			// });
		}
	});
	
	ipcMain.on('simulate-hotword', (event, text, hotword) => {
		// if (hotword === 'ANY') hotword = 'bumblebee';
		// else if (hotword === 'OFF') return;
		
		bbHotword.emit('hotword', hotword);
		// bumblebee.emit('hotword', hotword);
		
		deepspeech.setState({hotword});
		
		setTimeout(function() {
			deepspeech.processRecognition(text, {
				recogTime: 0,
				audioLength: 0,
				model: deepspeech.state.modelName,
				hotword
			});
		},1500);
		
	});
	
	ipcMain.on('simulate-stt', (event, text) => {
		deepspeech.processRecognition(text.toLowerCase(), {
			recogTime: 0,
			audioLength: 0,
			model: deepspeech.state.modelName
		});
	});
	
	deepspeech.on('vad', function (status) {
		// console.log('VAD', status);
		let functionName = 'updateVADStatus';
		let args = [status];
		app.execFunction(functionName, args);
	});
	
	// deepspeech.on('hotword', function (hotword, text, stats) {
	// 	console.log('DS hotword:'+hotword, 'text='+text, stats);
	// 	let functionName = 'hotwordResults';
	// 	let args = [hotword, text, stats];
	//
	// 	// bumblebee.playSound('hail');
	//
	// 	app.execFunction(functionName, args);
	// });
	//
	// deepspeech.on('recognize', function (text, stats) {
	// 	console.log('DS recognize', text, stats);
	// 	let functionName = 'deepspeechResults';
	// 	let args = [text, stats];
	// 	app.execFunction(functionName, args);
	// });
	
	return deepspeech;
}