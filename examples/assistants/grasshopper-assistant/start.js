const Bumblebee = require('jaxcore-bumblebee');

class GrasshopperAssistant extends Bumblebee.Assistant {
	constructor() {
		// every time the socket is started or stopped, a new instance of the assistant will be created
		super(...arguments);
	}
	
	// onBegin() is called once when the assistant called upon using a hotword or activated automatically
	async onBegin() {
		await this.bumblebee.say('Hi', {
			profile: 'Xenu'
		});
		await this.bumblebee.say('I\'m a grasshopper', {
			profile: 'Xenu'
		});
		await this.bumblebee.delay(1500);
		await this.bumblebee.say('Well...', {
			profile: 'Xenu'
		});
		await this.bumblebee.say('This has been fun', {
			profile: 'Xenu'
		});
		await this.bumblebee.delay(100);
		// return false in onBegin() to immediatley exit
		return false;
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		console.log('loop()');
		// not called in this scenario
	}
	
	// onStop is called after this.loop() returns, or if this.abort() was called
	async onStop() {
		await this.bumblebee.say('Goodbye');
	}
}

Bumblebee.connectAssistant('grasshopper', GrasshopperAssistant, {
	autoStart: true
});