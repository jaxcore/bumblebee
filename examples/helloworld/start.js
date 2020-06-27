// const Bumblebee = require('jaxcore-bumblebee');
const Bumblebee = require('../../');

class HelloWorldApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
		
		this.bumblebee.say('Hello World started');
	}
	
	async onBegin(args) {
		// args.text
		console.log('onBegin', args);
		debugger;
		await this.bumblebee.say('Hello World Begin');
	}
	
	async loop() {
		this.bumblebee.console('Say "Hello World"');
		let recognition = await this.bumblebee.recognize();
		if (recognition.text === 'hello world') {
			await this.bumblebee.say('Hello World');
		}
		if (recognition.text === 'exit') {
			await this.bumblebee.say('Exiting');
			return false;
		}
	}
	
	async onEnd() {
		await this.bumblebee.say('Hello World End');
	}
}

let application = Bumblebee.connectApplication(HelloWorldApp, {
	name: "Hello World",
	assistant: 'grasshopper',
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