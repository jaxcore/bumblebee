const BumblebeeAPI = require('../../../api');

class EdisonAssistant extends BumblebeeAPI.Assistant {
	constructor() {
		// each time the socket is started or stopped, a new instance of the assistant will be created
		super(...arguments);
		
		this.on('hotword', (hotword) => {
			// hotword events are triggered immediately when the hotword is detected
			this.bumblebee.console('hotword detected: ' + hotword);
		});
		
		this.on('command', (recognition) => {
			// command events are speech-to-text recognition that was processed at the same time the hotword was detected
			this.bumblebee.console('command detected: ' + recognition.text);
		});
	}
	
	async main() {
		// main is called once when the assistant is started or called upon using the hotword
		await this.bumblebee.say('Ask me anything.');
	}
	
	async loop() {
		// loop is called repeatedly after main until it returns true or an error is thrown
		console.log('loop()');
		
		let recognition = await this.bumblebee.recognize();
		if (recognition) {
			// received a speech-to-text recognition
			console.log('recognition:', recognition);
			this.bumblebee.console(recognition);
			
			// say "exit" to shut down the assistant
			if (recognition.text === 'exit') {
				await this.bumblebee.say('Exiting...');
				return true; // return out of the loop to shut down the assistant
			}
			
			if (/^who |what |when |where |why |how |is |are |were |was |does |will |am | should |would |if /.test(recognition.text)) {
				// answer everything with 42
				await this.bumblebee.say('The answer is 42');
			}
		}
	}
}

BumblebeeAPI.connectAssistant('hey_edison', EdisonAssistant, {
	autoStart: true
});