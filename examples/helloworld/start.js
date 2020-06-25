const Bumblebee = require('jaxcore-bumblebee');

class HelloWorldApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
	}
	async loop() {
		this.bumblebee.console('Say "Hello World"');
		let recognition = await this.bumblebee.recognize();
		if (recognition.text === 'hello world') {
			await this.bumblebee.say('Hello World');
		}
	}
}

const config = {
	// application: HelloWorldApp,
	name: "Hello World",
	autoStart: true,
	args: {
		text: 'hi galaxy'
	}
};

Bumblebee.connectApp(HelloWorldApp, config);

// module.exports = {
// 	bumblebee: config
// }