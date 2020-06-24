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
			//this.bumblebee.say('It looks like this is your first time using Bumblebee');
		}
	}
	
	// onHotword is called immediately when the hotword is detected
	async onHotword(hotword) {
		this.bumblebee.console('hotword detected: ' + hotword);
	}
	
	// onCommand is called when speech-to-text was processed at the same time hotword was detected
	async onCommand(recognition) {
		this.bumblebee.say('your command was: ' + recognition.text);
		this.bumblebee.console('command detected: ' + recognition.text);
	}
	
	// onBegin() is called once when the assistant called upon using a hotword or activated automatically
	async onBegin() {
		// this.bumblebee.console('Bumblebee Main Menu');
		if (this.doIntro) {
			// await this.bumblebee.say('Yes first time');
			await this.bumblebee.say('It looks like this is your first time using Bumblebee');
			await this.bumblebee.say('Try saying something into your microphone now');
		}
		else {
			await this.bumblebee.say('Bumblebee Ready');
		}
		const returnValue = {
			count: 0,
			previous: null
		};
		return returnValue;
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop(returnValue) {
		let recognition = await this.bumblebee.recognize();
		
		if (returnValue.previous) {
			console.log('pervious recognition:', recognition.text);
		}
		
		console.log('recognition:', recognition.text, 'returnValue:', returnValue);
		this.bumblebee.console(recognition);
		
		if (recognition.text === 'error') {
			throw new Error('oops');
		}
		
		// say "exit" to shut down the assistant
		if (recognition.text === 'exit') {
			return false; // return out of the loop to shut down the assistant
		}
		
		if (this.doIntro) {
			this.doIntro = false;
			await this.bumblebee.say('You said: ' + recognition.text);
			await this.bumblebee.say('Okay, that\'s terrific');
			await this.bumblebee.say('It looks like everything is working');
			await this.bumblebee.say('For information about how to use Bumblebee, visit the following web page');
			await this.bumblebee.console('https://github.com/jaxcore/bumblebee');
		}
		else {
			// respond with a text-to-speech instruction
			await this.bumblebee.console('You said: ' + recognition.text);
			await this.bumblebee.say('You said: ' + recognition.text);
		}
		
		returnValue.count++;
		
		// store the recognition so we can use it in the next loop
		returnValue.previous = recognition;
		
		return returnValue;
	}
	
	// onEnd() is called after this.loop() returns, or if this.abort() was called
	async onEnd(err, returnValue) {
		await this.bumblebee.say('Bumblebee Exiting...');
	}
}

module.exports = BumblebeeAssistant;