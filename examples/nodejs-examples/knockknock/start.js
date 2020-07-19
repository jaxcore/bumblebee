const Bumblebee = require('jaxcore-bumblebee');
const {sanitize} = Bumblebee;
const fs = require('fs');

class KnockKnockApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
		
		this.loadJokes();
		this.currentJoke = null;
		this.currentJokeLine = null;
		this.errorCount = 0;
	}
	
	async onBegin() {
		return this.nextJoke();
	}
	
	async loop() {
		let recognition = await this.recognize();
		
		let expectedResponseOrig = this.jokes[this.currentJoke][this.currentJokeLine+1];
		let expectedResponse = sanitize(expectedResponseOrig);
		this.console('Expected: '+expectedResponse);
		
		let text = recognition.text;
		
		this.console('Recognized: '+text);
		
		if (text === 'exit') {
			return false;
		}
		else if (recognition.text === expectedResponse) {
			await this.nextLine();
		}
		else {
			this.errorCount++;
			if (this.errorCount === 4) {
				await this.say('If you\'re having trouble, you can type your response into the console');
			}
			else if (this.errorCount === 1 || this.errorCount % 2 === 1) {
				await this.say('No, you\'re supposed to say: "' + expectedResponseOrig + '"');
			}
		}
	}
	
	async onEnd() {
		await this.say('Exiting');
	}
	
	loadJokes() {
		this.jokes = {};
		let files = fs.readdirSync('./jokes');
		files = files.filter(function (file) {
			return file.endsWith('.txt');
		});
		for (let file of files) {
			let content = fs.readFileSync('./jokes/'+file, 'utf-8').split(/\n/);
			this.jokes[file] = content;
		}
		
		this.jokesQueue = Object.keys(this.jokes);
		
		function shuffleArray(array) {
			for (var i = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		}
		
		shuffleArray(this.jokesQueue);
	}
	
	async nextJoke() {
		this.currentJoke = this.jokesQueue.shift();
		this.currentJokeLine = null;
		this.errorCount = 0;
		if (!this.currentJoke) {
			await this.say("Sorry, I don't know any more jokes");
			await this.say("To begin again, say \"Tell me a joke\"");
			await this.say("Or to exit, just say \"Exit\"");
			return;
		}
		await this.nextLine();
	}
	
	async nextLine() {
		const joke = this.jokes[this.currentJoke];
		if (this.currentJokeLine === null) this.currentJokeLine = 0;
		else {
			this.currentJokeLine += 2;
		}
		this.errorCount = 0;
		await this.playSound('click');
		let line = joke[this.currentJokeLine];
		await this.say(line);
		if (this.currentJokeLine >= joke.length-1) {
			await this.say('next joke');
			return this.nextJoke();
		}
	}
}

Bumblebee.connectApplication(KnockKnockApp, {
	name: "Knock Knock",
	autoStart: true
});