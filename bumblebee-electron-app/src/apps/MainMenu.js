import {CANCELLED, TIMEOUT, UNRECOGNIZED} from "../constants";

async function ConfirmCustomize(bumblebee) {
	const yes_or_no = [
		{
			text: 'Yes',
			matches: ['okay', 'yeah', 'ya', 'affirmative'],
			value: true
		},
		{
			text: 'No',
			matches: ['nope', 'na', 'negative'],
			value: false
		}
	];
	
	let customizeYesOrNo = await bumblebee.choose( "Do you want to customize Bumblebee?", yes_or_no, {
		style: 'yes_or_no',
		timeout: 5000,
		retryTimeout: true,
		retryUnrecognized: true,
		maximumRetries: 2,
		// unrecognizedText: "Sorry, I didn't understand"
	});
	
	if (customizeYesOrNo.error) {
		if (customizeYesOrNo.error === CANCELLED) {
			await bumblebee.say("Cancelled");
		}
		else if (customizeYesOrNo.error === UNRECOGNIZED) {
			await bumblebee.say("Sorry, your response was not recognized");
		}
		else if (customizeYesOrNo.error === TIMEOUT) {
			await bumblebee.say("Sorry, time is up");
		}
		return false;
	}
	if (customizeYesOrNo.value) {
		return bumblebee.launch('Customize');
	}
	else {
		return false;
	}
}
async function MainLoop(bumblebee) {
	
	let r = await bumblebee.recognize();
	
	if (r.stats.hotword) {
		bumblebee.console('hotword;' + r.stats.text);
	}
	else {
		bumblebee.addSpeechOutput({
			text: 'mm: ' + r.text,
			stats: r.stats,
			type: 'recognize'
		});
		// bumblebee.console('mm: '+r.text);
	}
	
	if (r.text === 'customize' || r.text === 'custom is' || r.text === 'customs' || r.text === 'customaries') {
		return ConfirmCustomize(bumblebee);
	}
	
	if (r.text === 'microphone off' || r.text === 'microphone of' || r.text === 'mike off' || r.text === 'mike of') {
		bumblebee.stopRecording();
	}
	
	if (r.text === 'clear console' || r.text === 'clear consul' || r.text === 'clear counsel') {
		bumblebee.clearConsole();
	}
	
	if (r.text === 'help') {
		return bumblebee.launch('Help');
	}
	
	if (r.text === 'settings') {
		return bumblebee.launch('Settings');
	}
	
	return MainLoop(bumblebee);
}

export default async function MainMenu(bumblebee) {
	await bumblebee.say("Main Menu");
	await bumblebee.say('For help at any time, say, help');
	return MainLoop(bumblebee);
}