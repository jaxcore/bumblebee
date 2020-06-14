export default async function main(bumblebee) {
	await bumblebee.say('Sorry, help menu is not ready yet');
	await bumblebee.say('To return to the main menu, say "exit"');
	return loop(bumblebee);
}

async function loop(bumblebee) {
	let r = await bumblebee.recognize();
	bumblebee.console('Help: '+r.text);
	
	if (r.text === 'exit') {
		await bumblebee.say("help menu exiting");
		return true;
	}
	
	return loop(bumblebee);
}