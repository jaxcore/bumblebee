const BumblebeeAPI = require('bumblebee-api');

class EdisonAssistant extends BumblebeeAPI.Assistant {
	
	// every time the assistant connects to the server, a new instance of the assistant will be created
	constructor() {
		super(...arguments);
	}
	
	// onStart is called once when the assistant called upon using a hotword or activated automatically
	async onStart() {
		await this.bumblebee.say('Hello, I am Edison');
		await this.bumblebee.say('Ask me anything');
	}
	
	// onHotword is called immediately when the hotword is detected
	async onHotword(hotword) {
		this.bumblebee.console('hotword detected: ' + hotword);
	}
	
	// onCommand is called when speech-to-text was processed at the same time hotword was detected
	async onCommand(recognition) {
		this.bumblebee.console('command detected: ' + recognition.text);
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		let recognition = await this.bumblebee.recognize();
		console.log('recognition:', recognition.text);
		this.bumblebee.console(recognition);
		
		if (recognition.text === 'exit') {
			// say "exit" to shut down the assistant
			return true; // return out of the loop to shut down the assistant
		}
		
		if (/^who |what |when |where |why |how |is |are |were |was |does |will |am | should |would |if |have |had |may |could /.test(recognition.text)) {
			// answer everything with 42
			await this.bumblebee.say('The answer is 42');
		}
	}
	
	// onStop is called after this.loop() returns, or if this.abort() was called
	async onStop() {
		await this.bumblebee.say('Exiting...');
	}
}

BumblebeeAPI.connectAssistant('hey_edison', EdisonAssistant, {
	autoStart: true
});