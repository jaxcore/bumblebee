const Bumblebee = require('jaxcore-bumblebee');

class GrasshopperAssistant extends Bumblebee.Assistant {
	constructor() {
		// every time the socket is started or stopped, a new instance of the assistant will be created
		super(...arguments);
		this.setSayProfile('Xenu');
	}
	
	// onBegin() is called once when the assistant called upon using a hotword or activated automatically
	async onBegin() {
		await this.say('Hi');
		await this.say('I\'m a grasshopper');
		await this.delay(1000);
		await this.say('Well...');
		await this.delay(500);
		await this.say('This has been fun...');
		await this.delay(500);
		// return false in onBegin() to immediately exit
		return false;
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		// not called in this scenario
	}
	
	// onEnd() is called after this.loop() returns, or if this.abort() was called
	async onEnd() {
		console.log('exiting');
	}
}

Bumblebee.connectAssistant(GrasshopperAssistant, {
	hotword: 'grasshopper',
	autoStart: true,
	timeout: 3000
});