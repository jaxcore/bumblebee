// const Bumblebee = require('jaxcore-bumblebee');
const Bumblebee = require('../../');

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

let application = Bumblebee.connectApplication(HelloWorldApp, {
	name: "Hello World",
	autoStart: true,
	args: {
		text: 'hi galaxy'
	},
	launchCommands: [
		'start hello world',
		'launch hello world'
	]
});
console.log('application', application);