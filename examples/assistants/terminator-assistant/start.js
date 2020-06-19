const BumblebeeAPI = require('bumblebee-api');
const playSoundFile = require('play-sound-file');

async function playSound() {
	const volume = 0.5;
	await playSoundFile(__dirname + '/terminator.wav', volume);
}

class TerminatorAssistant extends BumblebeeAPI.Assistant {
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
			
			if (recognition.text === 'exit') {
				this.bumblebee.say('Exiting...').then(() => {
					// to exit the assistant from a command, call bumblebee.abort()
					this.abort('command exited');
				})
			}
			else {
				this.bumblebee.say('Your command was not recognized: ' + recognition.text);
			}
		});
	}
	
	async onBeforeExit() {
		// onBeforeExit is called after this.loop() returns, or if this.abort() was called
		await this.bumblebee.say('I\'ll be back');
		await playSound(); // play the intro sound when exiting
	}
	
	async main() {
		// main is called once when the assistant is started or called upon using the hotword
		await playSound();
		await this.bumblebee.say('where is sare ah connor');
	}
	
	async loop() {
		// loop is called repeatedly after main until it returns true or an error is thrown
		
		let recognition = await this.bumblebee.recognize();
		if (recognition) {
			// received a speech-to-text recognition
			
			console.log('recognition:', recognition);
			this.bumblebee.console(recognition);
			
			if (recognition.text === 'error') {
				// throwing errors will exit the assistant
				throw new Error('oops');
			}
			
			// say "exit" to shut down the assistant
			if (recognition.text === 'exit') {
				return true; // to exit the assistant from the loop just return
			}
			else {
				// respond with a text-to-speech instruction
				await this.bumblebee.say('You said: ' + recognition.text);
			}
		}
	}
}

BumblebeeAPI.connectAssistant('terminator', TerminatorAssistant, {
	autoStart: true
});
