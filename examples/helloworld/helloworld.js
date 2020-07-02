const Bumblebee = require('jaxcore-bumblebee');

class HelloWorldApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
	}
	
	async loop() {
		this.console('Say "Hello World"');
		
		let recognition = await this.recognize();
		this.console(recognition);
		
		if (recognition.text === 'hello world') {
			await this.playSound('okay');
			await this.say('Hello World');
		}
		else {
			await this.playSound('error');
		}
	}
}

Bumblebee.connectApplication(HelloWorldApp, {
	name: "Hello World",
	autoStart: true
});