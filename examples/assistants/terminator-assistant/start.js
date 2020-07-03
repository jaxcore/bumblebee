const Bumblebee = require('jaxcore-bumblebee');

const playSoundFile = require('play-sound-file');
const {loopSoundFile} = playSoundFile;

class TerminatorAssistant extends Bumblebee.Assistant {
	
	// every time the assistant connects to the server, a new instance of the assistant will be created
	constructor() {
		super(...arguments);
		
		// playSoundFile(__dirname + '/terminator.wav', 0.7);
		
		// this.firstTime = true;
		
		setInterval(function() {
			console.log('.');
		},1000);
		// this.soundLoop = loopSoundFile(__dirname + '/loop.wav', 0.7);
	}
	
	startScanning() {
		if (this.scanning) return;
		this.scanning = true;
		// scan after 10 seconds
		this.scan();
		this.scanInterval = setInterval(() => {
			this.scan();
		}, 10000);
	}
	
	stopScanning() {
		clearInterval(this.scanInterval);
	}
	
	async scan() {
		this.console('Scanning...');
		await playSoundFile(__dirname + '/scanning.wav');
		this.console('Target not found');
	}
	
	// onHotword is called immediately when the hotword is detected
	async onHotword(hotword) {
		// this.console('onHotword(): ' + hotword);
		// await this.say('I need your clothes... your boots...');
		// await this.say('and your motorcycle');
	}
	
	// onCommand is called when speech-to-text was processed at the same time hotword was detected
	async onCommand(recognition) {
		this.console('onCommand(): ' + recognition.text);
		
		if (recognition.text === 'exit') {
			await this.say('Exiting...');
			// to exit the assistant from a command, call bumblebee.abort()
			return this.abort('command exited');
		}
		else {
			await this.say('Your command was not recognized: ' + recognition.text);
		}
	}
	
	// onBegin() is called once when the assistant called upon using a hotword or activated automatically
	async onBegin() {
		
		await playSoundFile('./terminator.wav', 0.7);
		
		await this.say('Where is Sarah Connor?', {
			replacements: {
				'sare ah': 'Sarah'
			}
		});
		
		await playSoundFile('./loop.wav', 0.7);
		
		// if (this.firstTime) {
		// 	this.firstTime = false;
		// 	return;
		// }
		// else {
		// }
		
		await this.startScanning();
		
		// this.soundLoop.start();
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		let recognition = await this.recognize();
		
		console.log('recognition:', recognition.text);
		this.console(recognition);
		
		if (recognition.text === 'error') {
			// throwing errors will exit the assistant
			throw new Error('oops');
		}
		
		// say "exit" to shut down the assistant
		if (recognition.text === 'exit') {
			return false; // to exit the assistant from the loop just return false
		}
		else {
			// respond with a text-to-speech instruction
			await this.say('You said: ' + recognition.text);
		}
	}
	
	// onEnd() is called after this.loop() returns, or if this.abort() was called
	async onEnd() {
		// this.soundLoop.stop();
		this.stopScanning();
		await this.say('I\'ll be back');
		await playSoundFile(__dirname + '/terminator.wav', 0.7);
	}
	
	async onTeardown() {
		this.stopScanning();
	}
}

Bumblebee.connectAssistant(TerminatorAssistant, {
	hotword: 'terminator',
	autoStart: true,
	timeout: 3000
});
