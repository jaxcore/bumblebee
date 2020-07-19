const Bumblebee = require('jaxcore-bumblebee');

class BumblebeeAssistant extends Bumblebee.Assistant {
	
	// every time the assistant connects to the server, a new instance of the assistant will be created
	constructor() {
		super(...arguments);
		
		this.doIntro = false;
	}
	
	// onSystemMessage is a command message from the server (eg. kill, reload etc)
	async onSystemMessage(message) {
		if (message.startBumblebeeIntro === true) {
			this.doIntro = true;
			//this.say('It looks like this is your first time using Bumblebee');
		}
	}
	
	// onHotword is called immediately when the hotword is detected
	async onHotword(hotword) {
		this.console('hotword detected: ' + hotword);
	}
	
	// onCommand is called when speech-to-text was processed at the same time hotword was detected
	async onCommand(recognition) {
		this.say('your command was: ' + recognition.text);
		this.console('command detected: ' + recognition.text);
	}
	
	// onBegin() is called once when the assistant called upon using a hotword or activated automatically
	async onBegin() {
		// this.console('Bumblebee Main Menu');
		if (this.doIntro) {
			// await this.say('Yes first time');
			await this.say('It looks like this is your first time using Bumblebee');
			await this.say('Try saying something into your microphone now');
		}
		else {
			await this.say('Bumblebee Ready');
		}
		const returnValue = {
			count: 0,
			previous: null
		};
		return returnValue;
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop(returnValue) {
		let recognition = await this.recognize();
		
		if (returnValue.previous) {
			console.log('pervious recognition:', recognition.text);
		}
		
		console.log('recognition:', recognition.text, 'returnValue:', returnValue);
		this.console(recognition);
		
		if (recognition.text === 'error') {
			throw new Error('oops');
		}
		
		// say "exit" to shut down the assistant
		if (recognition.text === 'exit') {
			return false; // return out of the loop to shut down the assistant
		}
		
		if (this.doIntro) {
			this.doIntro = false;
			await this.say('You said: ' + recognition.text);
			await this.say('Okay, that\'s terrific');
			await this.say('It looks like everything is working');
			await this.say('For information about how to use Bumblebee, visit the following web page');
			await this.console('https://github.com/jaxcore/bumblebee');
		}
		else {
			// respond with a text-to-speech instruction
			await this.console('You said: ' + recognition.text);
			await this.say('You said: ' + recognition.text);
		}
		
		returnValue.count++;
		
		// store the recognition so we can use it in the next loop
		returnValue.previous = recognition;
		
		return returnValue;
	}
	
	// onEnd() is called after this.loop() returns, or if this.abort() was called
	async onEnd(err, returnValue) {
		await this.say('Bumblebee Exiting...');
	}
}

module.exports = BumblebeeAssistant;