const Bumblebee = require('jaxcore-bumblebee');

class PorcupineAssistant extends Bumblebee.Assistant {
	constructor() {
		// every time the socket is started or stopped, a new instance of the assistant will be created
		super(...arguments);
	}
	
	// onHotword is called immediately when the hotword is detected
	async onHotword(hotword) {
		this.console('hotword detected: ' + hotword);
	}
	
	// onCommand is called when speech-to-text was processed at the same time hotword was detected
	async onCommand(recognition) {
		this.console('command detected: ' + recognition.text);
	}
	
	// onBegin() is called once when the assistant called upon using a hotword or activated automatically
	async onBegin() {
		await this.say('Porcupine Ready');
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		let recognition = await this.recognize();
		// received a speech-to-text recognition
		console.log('recognition:', recognition.text);
		this.console(recognition);
		
		// say "exit" to shut down the assistant
		if (recognition.text === 'exit') {
			return false; // return false exits the loop and temporarily shuts down the assistant
		}
		
		// respond with a text-to-speech instruction
		await this.say('You said: ' + recognition.text);
	}
	
	// onEnd() is called after this.loop() returns, or if this.abort() was called
	async onEnd() {
		await this.say('Exiting...');
	}
}

Bumblebee.connectAssistant(PorcupineAssistant, {
	hotword: 'porcupine',
	autoStart: true,
	timeout: 3000
});
