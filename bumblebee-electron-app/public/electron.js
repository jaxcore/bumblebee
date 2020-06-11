const electron = require('electron');
const app = electron.app;
const bootstrap = require('./bootstrap');

app.on('ready', function () {
	bootstrap.startBumblebeeElectron(function(bumblebeeElectron) {
		console.log('Bumblebee started:', bumblebeeElectron.state);
	});
	
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
