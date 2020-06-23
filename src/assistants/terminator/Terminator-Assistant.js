export default async function main(bumblebee) {
	await bumblebee.console("Terminator.main()");
	
	// await bumblebee.playSound('on', 'bumblebee');
	await bumblebee.say('Hello');
	await bumblebee.say('My name is Bumblebee');
	await bumblebee.say('For help at any time, just say "bumblebee help"');
	
	// await bumblebee.say('For help at any time, say: "Bumblebee help"');
	return loop(...arguments);
}

async function loop(bumblebee) {
	await bumblebee.console("Bumblebee.loop()");
	
	// let h = await hotword();
	// if (h) {
	// 	// handle hotword command
	//
	// 	return loop(...arguments)
	// }
	
	let r = await bumblebee.recognize();
	if (r.stats.hotword) {
		if (r.stats.hotword === 'bumblebee') {
			debugger;
		}
		else {
		
		}
	}
	
	bumblebee.console("Bumblebee: "+r.text);
	
	if (r.text === 'exit') {
		await bumblebee.say("main menu exiting");
		return true;
	}
	else if (r.text === 'settings') {
		await bumblebee.launch('Settings');
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