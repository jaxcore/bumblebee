const BumblebeeAPI = require('../../api');

class GrasshopperAssistant extends BumblebeeAPI.Assistant {
	constructor() {
		// constructor is called when the websocket has connected
		// each time the socket is started or stopped, a new instance of the assistant will be created
		super(...arguments);
		console.log('constructor()');
	}
	
	async main(args) {
		// main is called once when the assistant is started or called upon using the hotword
		console.log('main()');
		
		this.bumblebee.console('Grasshopper Main Menu');
		await this.bumblebee.say('Grasshopper Ready');
		
		return this.loop();
	}
	
	async loop() {
		console.log('loop()');
		
		let recognition = await this.bumblebee.recognize();
		if (recognition) {
			// received DeepSpeech recognition
			console.log('recognition:', recognition);
			this.bumblebee.console(recognition);
			await this.bumblebee.say('You said: ' + recognition.text);
			
			// say "exit" to shut down the assistant
			if (recognition.text === 'exit') {
				await this.bumblebee.say('exiting');
				return true; // return out of the loop to shut down the assistant
			}
		}
		
		// if nothing was recognized, call this.loop() again to wait for the next recognition
		return this.loop();
	}
}

module.exports = GrasshopperAssistant;