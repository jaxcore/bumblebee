export default async function main(bumblebee) {
	await bumblebee.console("Main.main()");
	return loop(bumblebee);
}

async function loop(bumblebee) {
	await bumblebee.console("Main.loop()");
	
	let r = await bumblebee.recognize();
	// let r = await bumblebee.hotword();
	if (r.stats.hotword) {
		debugger;
	}
	bumblebee.console("Main: "+r.text);
	
	if (r.text === 'exit') {
		await bumblebee.say("main exiting");
		return true;
	}
	else if (r.text === 'main menu') {
		await bumblebee.launch('Main Menu');
		await bumblebee.say("Main Menu exited");
	}
	else if (r.text === 'microphone off' || r.text === 'microphone of' || r.text === 'mike off' || r.text === 'mike of') {
		bumblebee.stopRecording();
	}
	else if (r.text === 'go to sleep') {
		bumblebee.setMuted(true);
		await bumblebee.say("Muting the microphone and going to sleep");
		
		let hotword = bumblebee.app.state.hotword;
		if (hotword === 'ANY') hotword = 'bumblebee';
		if (hotword === 'OFF') {
			bumblebee.setHotword('bumblebee');
			hotword = 'bumblebee';
		}
		await bumblebee.say("To wake me up, just say "+hotword);
	}
	else if (r.text === 'help') {
		await bumblebee.launch('Help');
		await bumblebee.say("main help done");
	}
	
	return loop(bumblebee);
}