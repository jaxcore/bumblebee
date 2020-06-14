const ipcMain = require('electron').ipcMain;

// todo: rename say to tts

module.exports = function connectTTS(bumblebee, app, sayNode) {
	
	// this promise issues a call to the front-end to perform a TTS operation
	async function tts(text, options, onBegin, onEnd) {
		return new Promise((resolve, reject) => {
			
			// send the text to the front end
			// the front end code then calls 'say-data' to retrieve the audio data
			// the audio is played client-side for visualization
			app.execFunction('say', [text, options], function (id) {
				console.log('SAY id=', id);
				// debugger;
				
				ipcMain.once('say-begin-'+id, function (id, text, optionss) {
					// debugger;
					onBegin();
				})
				ipcMain.once('say-end-'+id, function (id, text, optionss) {
					// debugger;
					onEnd();
					resolve();
				});
				// ipcMain.on('say-cancel', function (id, text, optionss) {
				// 	reject();
				// 	onEnd
				// });
			});
		});
	}
	
	// fornt-end calls the back-end to retrieve the TTS audio buffer
	ipcMain.handle('say-data', async (event, text, options) => {
		if (options && options.profile) {
			debugger;
		}
		else {
			debugger;
		}
		const result = await sayNode.getAudioData(text, options);
		return result;
	});
	
	// when the front-end needs to issue an TTS, it calls the back-end
	ipcMain.on('say', function(event, text, options) {
		// the back-end then issues a command back to the front-end, which in turn calls 'say-data' to retrieve the TTS audio buffer
		tts(text, options, function() {
			console.log('onBegin', text);
		}, function() {
			console.log('onEnd', text);
		});
	});
	
	return tts;
}