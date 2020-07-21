// todo: convert Settings to an app

async function settings() {
	await this.say('Bumblebee Settings');
	
	const mic = {
		text: 'Select Microphone',
		matches: ['microphone', 'changed microphone', 'change microphone', 'choose microphone']
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
		timeout: 5000,
		retryTimeout: true,
		retryUnrecognized: false,
		maximumRetries: 1,
		// unrecognizedText: "Sorry, I didn't understand",
		narrateChoices: true,
		enumerate: true
	});
	
	console.log('choice', typeof choice, choice);
	
	if (choice.error) {
		if (choice.recognition) {
			await this.say('Oops, you said '+choice.recognition.text);
		}
		if (choice.error === 'TIMEOUT') {
			await this.say('timed out');
		}
	}
	else {
		if (choice === mic) await chooseMicrophone.call(this);
		if (choice === voice) await chooseVoice.call(this);
	}
	
	let workingChoice = await this.choose('Do you want to exit settings?', [
		{
			text: 'Yes'
		},
		{
			text: 'No'
		}
	], {
		style: 'yes_or_no',
		timeout: 25000
	});
	
	if (workingChoice.index === 1) {
		return settings.call(this);
	}
	else {
		await this.say('Returning to the Bumblebee menu...');
	}
}

async function chooseMicrophone() {
	
	const returnValue = await this.systemRequest('microphone-list');
	console.log('returnValue', returnValue);
	if (returnValue.response && returnValue.response.length) {
		let l = returnValue.response.length;
		
		const microphones = returnValue.response.map(microphone => {
			return {
				text: microphone.name,
				tts: microphone.name.replace(/ \(.*/,''),
				value: microphone.id
			}
		});
		
		let choice = await this.choose('There are '+l+' microphones to choose from:', microphones, {
			timeout: 25000,
			retryTimeout: true,
			retryUnrecognized: true,
			maximumRetries: 2,
			// unrecognizedText: "Sorry, I didn't understand",
			narrateChoices: true,
			enumerate: true
		});
		
		if (choice) {
			await this.say('you have chosen '+choice.text);
			
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
					await this.say('Again');
					return chooseMicrophone.call(this);
				}
			}
			else {
				debugger;
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

async function chooseVoice() {
	await this.say('this part isn\'t finished yet');
	
	// let choices = [
	// 	{
	// 		text: 'Jack',
	// 		matches: []
	// 	},
	// 	{
	// 		text: 'Cylon',
	// 		matches: ['silon']
	// 	}
	// ];
	//
	// let choice = await this.choose("Which voice do you prefer?", choices, {
	// 	style: 'confirm',
	// 	timeout: 25000,
	// 	retryTimeout: true,
	// 	retryUnrecognized: true,
	// 	maximumRetries: 2,
	// 	// unrecognizedText: "Sorry, I didn't understand",
	// 	narrateChoices: true,
	// 	enumerate: true
	// });
	//
	// console.log('choice', choice);
	// if (choice) {
	// 	await this.say('you have chosen '+choice.text);
	// }
	// debugger;
}
module.exports = settings;