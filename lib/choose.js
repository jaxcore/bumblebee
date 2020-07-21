const {CANCELLED, UNRECOGNIZED, TIMEOUT} = require('./constants');
const {parseInteger} = require('./parser');

async function choose(text, choices, options) {
	if (text) {
		await this.say(text);
	}
	
	choices = choices.map((choice, index) => {
		choice.index = index;
		return choice;
	});
	
	if (options.enumerate) {
		choices = choices.map((choice, index) => {
			if (!('number' in choice)) choice.number = index + 1;
			return choice;
		})
	}
	
	if (options.narrateChoices) {
		for (let i=0;i<choices.length;i++) {
			let choice = choices[i];
			if (options.enumerate && choice.number) {
				let sayText = choice.tts || choice.text;
				await this.say(choice.number + ': ' + sayText, {
					consoleOutput: false
				});
			}
			else {
				await this.say(choice.text, {
					consoleOutput: false
				});
				if (i<choices.length-1) {
					await this.say('or', {
						consoleOutput: false
					});
				}
			}
		}
	}
	
	choices.forEach(choice => {
		if (choice.matches) {
			choice.matches = choice.matches.map(m => {
				return m.toLowerCase();
			});
		}
	});
	
	
	this.console({
		type: 'component',
		component: {
			choose: {
				choices,
				style: options.style,
				enumerate: options.enumerate
			}
		}
	});
	
	let recognition;
	try {
		recognition = await this.recognize({
			timeout: options.timeout
		});
	} catch (e) {
		let returnTimeout = {
			error: TIMEOUT,
			args: {
				...arguments
			}
		};
		
		if (options.retryTimeout) {
			if (!('retryCount' in options)) options.retryCount = 0;
			else options.retryCount++;
			if (options.maximumRetries && options.retryCount >= options.maximumRetries) {
				console.log('retryTimeout returnTimeout');
				return returnTimeout;
			}
			return this.choose(text, choices, options);
		}
		
		console.log('returnTimeout');
		return returnTimeout;
	}
	
	this.console('You chose: '+recognition.text);
	
	function submatches(text, matches) {
		if (!matches) return false;
		for (let m of matches) {
			if (text.endsWith(m)) return true;
			if (text.startsWith(m)) return true;
		}
		return false;
	}
	
	for (let i=0; i<choices.length; i++) {
		let match = recognition.text.toLowerCase() === choices[i].text.toLowerCase() ||
			(submatches(recognition.text.toLowerCase(), choices[i].matches));
		if (match) {
			return choices[i];
		}
	}
	
	if (options.enumerate) {
		// saying "one" selects the first choice, etc
		let number = parseInteger(recognition.text);
		if (number !== null) {
			if (number >= 1 && number <= choices.length) {
				for (let i=0; i<choices.length; i++) {
					if (number === choices[i].number) {
						this.console('match enumerate: '+number);
						return choices[i];
					}
				}
			}
			await this.say(number+' is not a valid option');
		}
	}
	
	const returnUnrecognized = {
		error: UNRECOGNIZED,
		recognition
	};
	
	if (options.retryUnrecognized) {
		if (!('retryCount' in options)) options.retryCount = 0;
		else options.retryCount++;
		if (options.maximumRetries && options.retryCount >= options.maximumRetries) {
			return returnUnrecognized;
		}
		return this.choose(text, choices, options);
	}
	
	return returnUnrecognized;
}

module.exports = choose;