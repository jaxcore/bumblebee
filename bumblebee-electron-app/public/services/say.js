const ipcMain = require('electron').ipcMain;

module.exports = function (bumblebeeElectron) {
	async function say(text, options, onBegin, onEnd) {
		return new Promise((resolve, reject) => {
			
			bumblebeeElectron.execFunction('say', [text, options], function (id) {
				console.log('SAY id=', id);
				debugger;
				
				ipcMain.once('say-begin-'+id, function (id, text, optionss) {
					debugger;
					onBegin();
				})
				ipcMain.once('say-end-'+id, function (id, text, optionss) {
					debugger;
					resolve();
					onEnd();
				});
				// ipcMain.on('say-cancel', function (id, text, optionss) {
				// 	reject();
				// 	onEnd
				// });
			});
			
		});
	}
	
	ipcMain.on('say', function(event, text, options) {
		say(text, options, function() {
			console.log('onBegin', text);
		}, function() {
			console.log('onEnd', text);
		});
	});
	
	return say;
}