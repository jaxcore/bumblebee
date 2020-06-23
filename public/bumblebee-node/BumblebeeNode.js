const EventEmitter = require('events');
// const playsound = require('./playsound');
const connectHotword = require('./hotword');
const connectTTS = require('./tts');
const connectSTT = require('./stt');

const connectWSServer = require('./wsserver');

const ipcMain = require('electron').ipcMain;

class BumblebeeNode extends EventEmitter {	// todo: refactor into an adapter
	constructor(app) {
		super();
		
		global.bumblebee = this;
		
		this.recording = false;
		
		this.app = app;
		this.jaxcore = app.jaxcore;
		
		// this.hotword = connectHotword(this, this.app, this.app.deepspeech);
		// this.deepspeech = connectSTT(this, this.app, this.app.deepspeech, this.hotword);
		this.deepspeech = connectSTT(this, this.app, this.app.deepspeech);
		this.say = connectTTS(this, this.app, this.app.sayNode);
		// this.bbWebsocketServer = connectWSServer(this, this.app, this.app.deepspeech, this.hotword, this.app.bbWebsocketServer);
		this.bbWebsocketServer = connectWSServer(this, this.app, this.app.deepspeech, this.app.bbWebsocketServer);
		
		// onSocketDisconnect
		// debugger;
		
		// connectWSServer(this, this.app, this.app.deepspeech, this.hotword, (bbWebsocketServer) => {
		// 	this.bbWebsocketServer = bbWebsocketServer;
		//
		// 	this.startMainMenu();
		// });
		
		this.soundThemesPath = __dirname + '/../sounds';
		
		ipcMain.handle('play-sound', async (event, name) => {
			const result = await this.playSound(name);
			return result;
		});
	}
	
	async playSoundNode(name, theme) {
		if (!theme) theme = 'startrek1';
		let file = this.soundThemesPath + '/' + theme + '/' + name + '.wav';
		console.log('playSoundNode:', file);
		// return playsound(file, 1);
	}
	
	async playSound(name, theme) {
		if (!theme) theme = 'startrek1';
		console.log('execFunction: playSound', name, theme);
		let id = this.app.execFunction('playSound', [name, theme]);
		ipcMain.once('playsound-end-'+id, () => {
			console.log('sound-end-'+id, name, 'has ended');
		});
	}
	
	console(data) {
		this.app.execFunction('displayConsole', [data]);
	}
}

module.exports = BumblebeeNode;
