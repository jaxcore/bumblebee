const ipcMain = require('electron').ipcMain;

module.exports = function connectSTT(bumblebee, app, deepspeech) {
	
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
	
	ipcMain.on('simulate-hotword', (event, text) => {
		console.log('simulate-hotword', text);
		
		let hotword;
		let first = text.substring(0, text.indexOf(' '))
		
		if (app.allHotwords.indexOf(text) > -1) {
			// HOT input just the hotword to call up the assistant
			hotword = text;
		}
		else if (app.allHotwords.indexOf(first) > -1) {
			hotword = first;
			// filter out the hotword
			
		}
		else if (app.state.activeAssistant) {
			hotword = app.state.activeAssistant;
		}
		else {
			console.log('no active assistant');
			return;
		}
		
		bumblebee.emit('hotword', hotword);
		deepspeech.setState({hotword});
		
		setTimeout(function() {
			deepspeech.processRecognition(text, {
				recogTime: 0,
				audioLength: 0,
				model: deepspeech.state.modelName,
				hotword
			});
		},1);
		
	});
	
	ipcMain.on('simulate-stt', (event, text) => {
		if (!text) return;
		text = text.toLowerCase().replace(/[^a-z0-9|']+/gi, " ").replace(/ +/," ").trim();
		deepspeech.processRecognition(text, {
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
	
	return deepspeech;
}