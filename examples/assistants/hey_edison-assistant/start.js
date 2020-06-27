const Bumblebee = require('jaxcore-bumblebee');

class HeyEdisonAssistant extends Bumblebee.Assistant {
	
	// every time the assistant connects to the server, a new instance of the assistant will be created
	constructor() {
		super(...arguments);
	}
	
	// onHotword is called immediately when the hotword is detected
	async onHotword(hotword) {
		this.bumblebee.console('hotword detected: ' + hotword);
	}
	
	// onCommand is called when speech-to-text was processed at the same time hotword was detected
	async onCommand(recognition) {
		this.bumblebee.console('command detected: ' + recognition.text);
	}
	
	// onBegin() is called once when the assistant called upon using a hotword or activated automatically
	async onBegin() {
		await this.bumblebee.say('Hello, I am Edison');
		await this.bumblebee.say('Ask me anything');
	}
	
	// loop() is called repeatedly and waits for speech-to-text recognition events
	async loop() {
		let recognition = await this.bumblebee.recognize();
		console.log('recognition:', recognition.text);
		this.bumblebee.console(recognition);
		
		if (recognition.text === 'exit') {
			// say "exit" to shut down the assistant
			return false; // return false exits the loop and temporarily shuts down the assistant
		}
		
		if (/^who |what |when |where |why |how |is |are |were |was |does |will |am | should |would |if |have |had |may |could /.test(recognition.text)) {
			// answer everything with 42
			await this.bumblebee.say('The answer is 42');
		}
	}
	
	// onEnd() is called after this.loop() returns, or if this.abort() was called
	async onEnd() {
		await this.bumblebee.say('Exiting...');
	}
}

Bumblebee.connectAssistant(HeyEdisonAssistant, {
	hotword: 'hey_edison',
	autoStart: true,
	timeout: 3000
});
