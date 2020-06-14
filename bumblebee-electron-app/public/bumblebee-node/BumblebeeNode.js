const EventEmitter = require('events');
const playsound = require('./playsound');
const connectHotword = require('./hotword');
const connectTTS = require('./tts');
const connectSTT = require('./stt');

const ipcMain = require('electron').ipcMain;

class BumblebeeClient extends EventEmitter {
	constructor(jaxcore, bumblebeeElectron, deepspeech, sayNode) {
		super();
		
		this.recording = false;
		
		this.jaxcore = jaxcore;
		
		this.app = bumblebeeElectron;
		this.bumblebeeHotword = connectHotword(this, this.app, deepspeech);
		this.deepspeech = connectSTT(this, this.app, deepspeech, this.bumblebeeHotword);
		
		this.say = connectTTS(this, this.app, sayNode);
		
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
		return playsound(file, 1);
	}
	
	async playSound(name, theme) {
		if (!theme) theme = 'startrek1';
		console.log('execFunction: playSound', name, theme);
		let id = this.app.execFunction('playSound', [name, theme]);
		ipcMain.once('playsound-end-'+id, () => {
			console.log('sound-end-'+id, name, 'has ended');
		});
	}
	
}

module.exports = BumblebeeClient;
