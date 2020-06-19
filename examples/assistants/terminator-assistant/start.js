const BumblebeeAPI = require('bumblebee-api');
const playSoundFile = require('play-sound-file');

async function playSound() {
	const volume = 0.5;
	await playSoundFile(__dirname + '/terminator.wav', volume);
}

class TerminatorAssistant extends BumblebeeAPI.Assistant {
	
	// every time the assistant connects to the server, a new instance of the assistant will be created
	constructor() {
		super(...arguments);
	}
	
	// onStart is called once when the assistant called upon using a hotword or activated automatically
	async onStart() {
		await playSound();
		await this.bumblebee.say('where is sare ah connor');
	}
	
	// onHotword is called immediately when the hotword is detected
	async onHotword(hotword) {
		this.bumblebee.console('hotword detected: ' + hotword);
	}
	
	// onCommand is called when speech-to-text was processed at the same time hotword was detected
	async onCommand(recognition) {
		this.bumblebee.console('command detected: ' + recognition.text);
		
		if (recognition.text === 'exit') {
			await this.bumblebee.say('Exiting...');
			// to exit the assistant from a command, call bumblebee.abort()
			return this.abort('command exited');
		}
		else {
			await this.bumblebee.say('Your command was not recognized: ' + recognition.text);
		}
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		let recognition = await this.bumblebee.recognize();
		console.log('recognition:', recognition.text);
		this.bumblebee.console(recognition);
		
		if (recognition.text === 'error') {
			// throwing errors will exit the assistant
			throw new Error('oops');
		}
		
		// say "exit" to shut down the assistant
		if (recognition.text === 'exit') {
			return true; // to exit the assistant from the loop just return
		}
		else {
			// respond with a text-to-speech instruction
			await this.bumblebee.say('You said: ' + recognition.text);
		}
	}
	
	// onStop is called after this.loop() returns, or if this.abort() was called
	async onStop() {
		await this.bumblebee.say('I\'ll be back');
		await playSound(); // play the intro sound when exiting
	}
}

BumblebeeAPI.connectAssistant('terminator', TerminatorAssistant, {
	autoStart: true
});
