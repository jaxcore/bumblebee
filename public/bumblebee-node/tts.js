const ipcMain = require('electron').ipcMain;

module.exports = function connectTTS(bumblebee, app, sayNode) {
	function say(text, options, onBegin) {
		return new Promise((resolve, reject) => {
			app.execFunction('say', [text, options], function (id) {
				ipcMain.once('say-begin-'+id, function (id, text, options) {
					if (onBegin) onBegin();
				})
				ipcMain.once('say-end-'+id, function (id, text, options) {
					resolve();
				});
			});
		});
	}
	
	function saySound(name, theme, onBegin) {
		return new Promise((resolve, reject) => {
			const id = Math.random().toString().substring(2);
			ipcMain.once('say-begin-'+id, function (id) {
				if (onBegin) onBegin();
			})
			ipcMain.once('say-end-'+id, function (id) {
				resolve();
			});
			app.execFunction('saySound', [name, theme, id]);
		});
	}
	
	bumblebee.saySound = saySound;
	
	ipcMain.handle('say-data', async (event, text, options) => {
		return sayNode.getAudioData(text, options);
	});
	
	ipcMain.on('say', function(event, text, options) {
		// the back-end then issues a command back to the front-end, which in turn calls 'say-data' to retrieve the TTS audio buffer
		say(text, options, function() {
			console.log('onBegin', text);
		}, function() {
			console.log('onEnd', text);
		});
	});
	
	return say;
}