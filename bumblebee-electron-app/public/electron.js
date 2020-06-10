// This project was based off of this electron/react tutorial:
// https://www.codementor.io/randyfindley/how-to-build-an-electron-app-using-create-react-app-and-electron-builder-ss1k0sfer

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const path = require('path');
const isDev = require('electron-is-dev');

const Say = require('jaxcore-say-node');
const sayNode = new Say({
	language: 'en',
	profile: 'Jack'
});

const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

const executeFunction = require('./executeFunction');
const bumblebee = require('./bumblebee');
const soundplayer = require('./soundplayer');

if (isDev) process.env.NODE_ENV = 'dev';

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 480,
		height: 640,
		webPreferences: {
			// allow code inside this window to use use native window.open()
			nativeWindowOpen: true,
			nodeIntegration: true,
			nodeIntegrationInWorker: true,
			preload: __dirname + '/preload.js'
		}
	});
	
	mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
	
	if (isDev) {
		// Open the DevTools.
		// BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
		// mainWindow.webContents.openDevTools();
	}
	
	mainWindow.on('closed', () => mainWindow = null);
	
	mainWindow.on('close', function (event) {
		console.log('close -> hide');
		event.preventDefault();
		mainWindow.hide();
	});
	
	ipcMain.handle('say-data', async (event, text, options) => {
		const result = await sayNode.getAudioData(text, options);
		return result;
	})
	
	ipcMain.on('hotword-select', (event, hotword) => {
		if (hotword === 'OFF') {
			hotword = null;
			bumblebee.setEnabled(false);
		}
		else {
			if (hotword === 'ANY') {
				hotword = null;
			}
			bumblebee.setEnabled(true);
		}
		bumblebee.setHotword(hotword);
	});
	
	ipcMain.on('dev-tools', (event, arg) => {
		mainWindow.webContents.openDevTools();
	});
	
	ipcMain.on('client-ready', (event, arg) => {
		event.reply('electron-ready');
	});
	
	
	bumblebee.on('hotword', function (hotword) {
		console.log('');
		console.log('Hotword Detected:', hotword);
		let functionName = 'hotwordDetected';
		let args = [hotword];
		executeFunction(mainWindow, functionName, args, function () {
			console.log('hotwordDetected code complete');
		});
	});
	
	// start the jaxcore deepspeech service
	jaxcore.startService('deepspeech', {
		modelName: 'english',
		modelPath: __dirname + '/../deepspeech-0.7.3-models',
		silenceThreshold: 600,
		vadMode: 'VERY_AGGRESSIVE',
		debug: true
	}, function (err, deepspeech) {
		console.log('deepspeech service ready');
		
		bumblebee.on('data', function (intData, sampleRate, hotword, float32arr) {
			deepspeech.dualStreamData(intData, float32arr, 16000, hotword);
		});
		
		deepspeech.on('no-recognition', function (hotword) {
			if (hotword) {
				soundplayer('sounds/startrek1/off');
				let functionName = 'hotwordResults';
				let args = [hotword, null, null];
				executeFunction(mainWindow, functionName, args, function () {
					console.log('deepspeechResults code complete');
				});
			}
		});
		
		ipcMain.on('microphone-muted', (event, muted) => {
			console.log('bumblebee.setMuted', muted)
			bumblebee.setMuted(muted);
		});
		
		ipcMain.on('recording-start', (event) => {
			bumblebee.start();
		});
		ipcMain.on('recording-stop', (event) => {
			bumblebee.stop();
		});
		
		ipcMain.on('simulate-hotword', (event, text, hotword) => {
			if (hotword === 'ANY') hotword = 'bumblebee';
			else if (hotword === 'OFF') return;
			
			bumblebee.emit('hotword', hotword);
			
			deepspeech.setState({hotword});
			
			setTimeout(function() {
				deepspeech.processRecognition(text, {
					recogTime: 0,
					audioLength: 0,
					model: deepspeech.state.modelName,
					hotword
				});
			},300);
			
		});
		
		ipcMain.on('simulate-stt', (event, text) => {
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
			executeFunction(mainWindow, functionName, args);
		});
		
		deepspeech.on('hotword', function (hotword, text, stats) {
			console.log('DS hotword:'+hotword, 'text='+text, stats);
			let functionName = 'hotwordResults';
			let args = [hotword, text, stats];
			
			soundplayer('sounds/startrek1/off');
			
			executeFunction(mainWindow, functionName, args);
		});
		
		
		deepspeech.on('recognize', function (text, stats) {
			console.log('DS recognize', text, stats);
			let functionName = 'deepspeechResults';
			let args = [text, stats];
			executeFunction(mainWindow, functionName, args);
		});
		
		ipcMain.on('stream-data', (event, data, sampleRate) => {
			bumblebee.transcode(data, sampleRate, (deepspeechData, vadData, outputSampleRate, hotword) => {
				deepspeech.dualStreamData(deepspeechData, vadData, outputSampleRate, hotword);
			});
		});
		
	});
}

app.on('ready', function () {
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
