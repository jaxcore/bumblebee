const EventEmitter = require('events');
const connectTTS = require('./tts');
const connectSTT = require('./stt');
const connectWSServer = require('./wsserver');

class BumblebeeNode extends EventEmitter {	// todo: refactor into an adapter
	constructor(app) {
		super();
		global.bumblebee = this;
		this.recording = false;
		this.app = app;
		this.jaxcore = app.jaxcore;
		this.deepspeech = connectSTT(this, this.app, this.app.deepspeech);
		this.say = connectTTS(this, this.app, this.app.sayNode);
		this.bbWebsocketServer = connectWSServer(this, this.app, this.app.deepspeech, this.app.bbWebsocketServer);
	}
	
	console(data) {
		this.app.execFunction('displayConsole', [data]);
	}
}

module.exports = BumblebeeNode;
