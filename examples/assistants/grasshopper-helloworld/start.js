const Bumblebee = require('jaxcore-bumblebee');

class GrasshopperHelloWorld extends Bumblebee.Assistant {
	constructor() {
		// every time the socket is started or stopped, a new instance of the assistant will be created
		super(...arguments);
	}
	
	// onBegin() is called once when the assistant called upon using a hotword or activated automatically
	async onBegin() {
		await this.bumblebee.say('grasshopper ready');
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		console.log('loop()');
		
		let recognition = await this.bumblebee.recognize();
		if (recognition.text === 'hello') {
			console.log('waiting Hello World return')
			const appReturn = await this.run('Hello World', {
				arg1: 123
			});
			
			console.log('appReturn', appReturn);
			process.exit();
		}
		// not called in this scenario
	}
	
	// onEnd() is called after this.loop() returns, or if this.abort() was called
	async onEnd() {
	}
	
	async onApplicationAdded(appId, options) {
		this.log('onApplicationAdded', appId, options);
		debugger;
	}
	
	async onApplicationRemoved(appId, options) {
		this.log('onApplicationRemoved', appId, options);
		debugger;
	}
}

Bumblebee.connectAssistant(GrasshopperHelloWorld, {
	hotword: 'grasshopper',
	autoStart: true,
	timeout: 3000
});