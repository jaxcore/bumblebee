// const Bumblebee = require('jaxcore-bumblebee');
const Bumblebee = require('../../');

class HelloWorldApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
		
		// this.bumblebee.say('Hello World started');
		this.bumblebee.say(this.state.greetings);
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
			await this.bumblebee.say('ending');
			this.return('he said hello world');
		}
		else if (recognition.text === 'exit') {
			await this.bumblebee.say('Exiting');
			return false;
			// this.error('did not say hello world');
		}
		else {
			await this.bumblebee.say('did not recognize '+recognition.text);
		}
	}
	
	async onEnd(e, r) {
		if (e) this.bumblebee.console('onEnd e = '+e);
		if (r) {
			this.bumblebee.console('onEnd r = '+r);
			await this.bumblebee.say('returned '+r);
		}
		await this.bumblebee.say('Hello World Ending');
	}
}

let application = Bumblebee.connectApplication(HelloWorldApp, {
	name: "Hello World",
	assistant: 'grasshopper',
	autoStart: true,
	initialState: {
		greetings: 'hi galaxy'
	},
	launchCommands: [
		'start hello world',
		'launch hello world'
	]
});
console.log('application', application);