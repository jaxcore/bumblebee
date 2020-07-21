async function settings() {
	await this.say('Bumblebee Settings');
	
	const mic = {
		text: 'Select Microphone',
		matches: ['microphone', 'changed microphone', 'change microphone', 'choose microphone', 'switch microphone']
	};
	const voice = {
		text: 'Select Voice',
		matches: ['voice', 'choose voice', 'changed voice', 'change voice']
	};
	
	let choices = [
		mic,
		voice
	];
	
	let choice = await this.choose("The options are:", choices, {
		style: 'confirm',
		timeout: 25000,
		retryTimeout: true,
		retryUnrecognized: false,
		maximumRetries: 2,
		narrateChoices: true,
		enumerate: true
	});
	
	if (choice === mic) await chooseMicrophone.call(this);
	if (choice === voice) await chooseVoice.call(this);
	
	let workingChoice = await this.choose('Do you want to exit settings?', [
		{
			text: 'Yes',
			matches: ['okay', 'yeah', 'yup', 'alright', 'affirmative']
		},
		{
			text: 'No',
			matches: ['nope', 'negative']
		}
	], {
		style: 'yes_or_no',
		timeout: 25000
	});
	
	if (workingChoice.index === 1) {
		return settings.call(this);
	}
	
	/// Returning to the Bumblebee menu
}

async function chooseMicrophone() {
	
	const returnValue = await this.systemRequest('microphone-list');
	console.log('returnValue', returnValue);
	if (returnValue.response && returnValue.response.length) {
		let l = returnValue.response.length;
		
		const microphones = returnValue.response.map(microphone => {
			return {
				text: microphone.name,
				tts: microphone.name.replace(/ \(.*/, ''),
				value: microphone.id
			}
		});
		
		let choice = await this.choose('There are ' + l + ' microphones to choose from:', microphones, {
			timeout: 25000,
			retryTimeout: true,
			retryUnrecognized: true,
			maximumRetries: 2,
			// unrecognizedText: "Sorry, I didn't understand",
			narrateChoices: true,
			enumerate: true
		});
		
		if (choice) {
			await this.say('you have chosen ' + choice.text);
			
			const returnValue = await this.systemRequest('select-microphone', choice.value);
			if (returnValue.response) {
				await this.say('Okay, I\'ve switched the microphone');
				let workingChoice = await this.choose('Can you tell me if it is working?', [
					{
						text: 'Yes'
					},
					{
						text: 'No'
					}
				], {
					style: 'yes_or_no'
				});
				if (workingChoice.index === 0) {
					await this.say('That\s great!');
					await this.say('Returning to settings...');
				}
				else {
					return chooseMicrophone.call(this);
				}
			}
		}
		else {
			await this.say('no');
		}
	}
	else {
		await this.say('no microphones were found');
	}
}

const profiles = [
	{
		text: 'Jack',
		matches: []
	},
	{
		text: 'Pris',
		tts: 'priss',
		matches: ['press']
	},
	{
		text: 'Roy',
		matches: []
	},
	{
		text: 'Scotty',
		matches: []
	},
	{
		text: 'Xenu',
		tts: 'zeenu',
		matches: ['zeno']
	},
	{
		text: 'Cylon',
		matches: ['simon', 'sile']
	},
	{
		text: 'Leon',
		matches: []
	},
	{
		text: 'Rachel',
		matches: []
	},
	{
		text: 'Zhora',
		tts: 'zhor-ah',
		matches: []
	},
	{
		text: 'The Borg',
		value: 'Borg',
		matches: ['the board', 'the boar', 'he bore', 'the lord', 'to the borg', 'the more', 'board', 'born', 'more', 'boar', 'lord']
	}
];

async function chooseVoice() {
	await this.say("Which voice do you prefer?");
	
	let c = 1;
	for (let profile of profiles) {
		console.log('profile', profile.text);
		let ttsName = profile.tts || profile.text;
		await this.say(c.toString() + ': ' + ttsName, {
			displayConsole: false,
			profile: profile.value || profile.text
		});
		c++;
	}
	
	let choice = await this.choose(null, profiles, {
		style: 'confirm',
		timeout: 25000,
		retryTimeout: true,
		retryUnrecognized: true,
		maximumRetries: 2,
		// unrecognizedText: "Sorry, I didn't understand",
		narrateChoices: false,
		enumerate: true
	});
	
	if (choice.error) {
		await this.say('invalid selection');
		return;
	}
	else {
		// let ttsName = choice.tts || choice.text;
		let replacements = {};
		if (choice.tts && choice.tts !== choice.text) {
			replacements[choice.text] = choice.tts;
		}
		let value = choice.value || choice.text;
		this.console('say-default-profile: ' + value);
		const returnValue = await this.systemRequest('say-default-profile', value);
		await this.say('The default voice has been set to ' + choice.text, {
			replacements
		});
	}
}

module.exports = settings;