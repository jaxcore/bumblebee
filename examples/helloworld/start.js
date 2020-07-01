// const Bumblebee = require('jaxcore-bumblebee');
const Bumblebee = require('../../');

class HelloWorldApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
		
		console.log('HelloWorldApp constructor');
		this.console('HelloWorldApp constructor');
		// this.say('Hello World started');
		this.say('greetings '+this.state.greetings);
	}
	
	async onBegin(args) {
		// args.text
		console.log('HelloWorldApp onBegin', args);
		
		// debugger;
		this.console('onBegin '+JSON.stringify(args));
		
		await this.say('Hello World Begin');
	}
	
	async loop() {
		this.console('Say "Hello World"');
		let recognition = await this.recognize();
		if (recognition.text === 'hello world') {
			await this.say('Hello World');
			await this.say('ending');
			this.return('he said hello world');
		}
		else if (recognition.text === 'exit') {
			await this.say('Exiting');
			return false;
			// this.error('did not say hello world');
		}
		else {
			await this.say('hello world did not recognize '+recognition.text);
		}
	}
	
	async onEnd(e, r) {
		if (e) this.console('onEnd e = '+e);
		if (r) {
			this.console('onEnd r = '+r);
			await this.say('returned '+r);
		}
		await this.say('Hello World Ending');
	}
}

let application = Bumblebee.connectApplication(HelloWorldApp, {
	name: "Hello World",
	assistant: 'grasshopper',
	autoStart: true,
	initialArgs: {
		arg1: 123
	},
	initialState: {
		greetings: 'hi galaxy'
	},
	launchCommands: [
		'start hello world',
		'launch hello world'
	]
});
console.log('application', application);