// Bumblebee Apps
import Help from './Help';
import Settings from './Settings';
import DeepSpeechInstalled from './DeepSpeechInstalled';

export default async function main(bumblebee, text) {
	// if (text) {
	// 	debugger;
	// }
	// await bumblebee.say("Bumblebee Main");
	await bumblebee.console("Bumblebee.main()");
	await bumblebee.say('Hello');
	await bumblebee.say('My name is Bumblebee');
	await bumblebee.say('For help at any time, just say "Bumblebee Help"');
	// await bumblebee.say('For help at any time, say: "Bumblebee help"');
	
	bumblebee.addApp('bumblebee', 'Settings', Settings);
	bumblebee.addApp('bumblebee', 'DeepSpeech Installed', DeepSpeechInstalled);
	bumblebee.addApp('bumblebee', 'Help', Help);
	
	// bumblebee.on('hotword-bumblebee', () => {
	// 	debugger;
	// });
	//
	
	bumblebee.on('hotword-command-bumblebee', (text, stats) => {
		debugger;
	});
	
	let r = loop(...arguments);
	
	return r;
}

async function loop(bumblebee) {
	await bumblebee.console("Bumblebee.loop()");

	// let h = await hotword();
	// if (h) {
	// 	// handle hotword command
	//	
	// 	return loop(...arguments)
	// }
	
	let r = await bumblebee.recognize({
		timeout: 30000
	});
	if (r.stats.hotword) {
		debugger;
	}
	
	bumblebee.console("Bumblebee: "+r.text);
	
	if (r.text === 'exit') {
		await bumblebee.say("Bumblebee exiting");
		return true;
	}
	else if (r.text === 'settings') {
		await bumblebee.launch('bumblebee', 'Settings');
		await bumblebee.say("settings done");
	}
	else if (r.text === 'microphone off' || r.text === 'microphone of' || r.text === 'mike off' || r.text === 'mike of') {
		bumblebee.stopRecording();
	}
	else if (r.text === 'clear console' || r.text === 'clear consul' || r.text === 'clear counsel') {
		bumblebee.clearConsole();
	}
	else if (r.text === 'help') {
		await bumblebee.launch('Help');
	}
	
	return loop(...arguments);
}