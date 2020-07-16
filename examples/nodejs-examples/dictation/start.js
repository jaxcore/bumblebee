const Bumblebee = require('jaxcore-bumblebee');
const robot = require('robotjs');

class DictationApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
	}
	
	async onBegin() {
		await this.say("Voice Dictation activated");
	}
	
	async loop() {
		let recognition = await this.recognize();
		this.console(recognition);
		robot.typeString(recognition.text);
		robot.keyTap('enter')
	}
}

Bumblebee.connectApplication(DictationApp, {
	name: "Dictation",
	autoStart: true
});