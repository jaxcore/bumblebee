import {CANCELLED, UNRECOGNIZED, TIMEOUT} from '../constants';

async function Customize(bumblebee) {
	
	await bumblebee.say("Which speech synthesis voice do you prefer?");
	
	const profiles = [
		{
			number: 1,
			text: 'Jack',
			value: 'Jack'
		},
		{
			number: 2,
			text: 'Cylon',
			matches: ['silan', 'silo'],
			value: 'Cylon'
		},
		{
			number: 3,
			text: 'Zhora',
			matches: ['zora'],
			value: 'Zhora'
		}
	];
	
	await bumblebee.say("The options are...");
	
	for (const profile of profiles) {
		await bumblebee.say(profile.number + ': ' + profile.text, {
			profile: profile.value,
			ttsOutput: false
		});
	}
	
	let profileChoice = await bumblebee.choose(null, profiles, {
		style: 'confirm',
		timeout: 25000,
		retryTimeout: true,
		retryUnrecognized: true,
		maximumRetries: 3,
		// unrecognizedText: "Sorry, I didn't understand",
		narrateChoices: false,
		numberize: true
	});
	
	if (profileChoice.error) {
		await bumblebee.say("there was an error, exiting");
		return false;
	}
	
	bumblebee.sayProfile(profileChoice.value);
	// debugger;
	
	await bumblebee.say("You selected " + profileChoice.text);
	
	return true;
}

export default Customize;