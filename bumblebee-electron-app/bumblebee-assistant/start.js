const BumblebeeAPI = require('bumblebee-api');

class BumblebeeAssistant extends BumblebeeAPI.Assistant {
	
	// every time the assistant connects to the server, a new instance of the assistant will be created
	constructor() {
		super(...arguments);
	}
	
	// onStart is called once when the assistant called upon using a hotword or activated automatically
	async onStart() {
		this.bumblebee.console('Bumblebee Main Menu');
		await this.bumblebee.say('Bumblebee Ready');
	}
	
	// onHotword is called immediately when the hotword is detected
	async onHotword(hotword) {
		this.bumblebee.console('hotword detected: ' + hotword);
	}
	
	// onCommand is called when speech-to-text was processed at the same time hotword was detected
	async onCommand(recognition) {
		this.bumblebee.say('your command was: ' + recognition.text);
		this.bumblebee.console('command detected: ' + recognition.text);
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		let recognition = await this.bumblebee.recognize();
		console.log('recognition:', recognition.text);
		this.bumblebee.console(recognition);
		
		if (recognition.text === 'error') {
			throw new Error('oops');
		}
		
		// say "exit" to shut down the assistant
		if (recognition.text === 'exit') {
			return true; // return out of the loop to shut down the assistant
		}
		
		// respond with a text-to-speech instruction
		await this.bumblebee.say('You said: ' + recognition.text);
	}
	
	// onStop is called after this.loop() returns, or if this.abort() was called
	async onStop() {
		await this.bumblebee.say('Bumblebee Exiting...');
	}
}

BumblebeeAPI.connectAssistant('bumblebee', BumblebeeAssistant, {
	autoStart: true
});