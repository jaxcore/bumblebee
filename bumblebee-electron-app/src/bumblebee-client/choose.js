// import React from "react";
import {CANCELLED, UNRECOGNIZED, TIMEOUT} from '../constants';

async function choose(text, choices, options) {
	if (text) {
		await this.say(text);
	}
	
	if (options.numberize) {
		choices = choices.map((choice, index) => {
			if (!('number' in choice)) choice.number = index + 1;
			return choice;
		})
	}
	
	if (options.narrateChoices) {
		// const sayChoices = choices.map(c => {
		// 	return this.say(c.number + ': ' + c.text);
		// })
		// await Promise.allSettled(sayChoices);
		for (let i=0;i<choices.length;i++) {
			let choice = choices[i];
			if (options.numberize && choice.number) {
				await this.say(choice.number + ': ' + choice.text, {
					ttsOutput: false
				});
			}
			else {
				await this.say(choice.text, {
					ttsOutput: false
				});
				if (i<choices.length-1) {
					await this.say('or', {
						ttsOutput: false
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
				numberize: options.numberize
			}
		}
	});
	
	// if (choices.length === 2) {
	// 	this.console({
	// 		choices,
	// 		options.style
	// 		// choice: choices.map((choice, index) => {
	// 		// 	let num;
	// 		// 	if ('number' in choice) num = choice.number;
	// 		// 	else choice.number = index + 1;
	// 		// 	return choice;
	// 		// })
	// 	});
	//
	// 	// this.console(<span>
	// 	// 	<a href="#" onClick={e => {this.simulateSTT(choices[0].text)}}>{choices[0].text}</a> or <a href="#" onClick={e => {this.simulateSTT(choices[1].text)}}>{choices[1].text}</a>
	// 	// </span>);
	// }
	// else if (choices.length > 2) {
	//
	//
	// 		// this.console((<ul className="nobullet">
	// 		// 	{choices.map((choice, index) => {
	// 		// 		let num;
	// 		// 		if ('number' in choice) num = choice.number;
	// 		// 		else choice.number = index + 1;
	// 		//
	// 		// 		return (<li>
	// 		// 			<a href="#" onClick={e => this.simulateSTT(choice.number)}>{choice.number}</a>:&nbsp;
	// 		// 			<a href="#" onClick={e => this.simulateSTT(choice.text)}>{choice.text}</a>
	// 		// 		</li>)
	// 		// 	})}
	// 		// </ul>));
	// 	}
	// 	else {
	// 		this.console((<ul>
	// 			{choices.map((choice, index) => {
	// 				const handler = (e) => {
	// 					this.simulateSTT(choice.text);
	// 				};
	// 				return (<li key={index}><a href="#" onClick={handler}>{choice.text}</a></li>)
	// 			})}
	// 		</ul>));
	// 	}
	// }
	// else {
	// 	throw new Error('not enough choices');
	// }
	
	let response;
	try {
		response = await this.recognize({
			timeout: options.timeout
		});
	} catch (e) {
		
		// debugger;
		
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
				return returnTimeout;
			}
			return this.choose(text, choices, options);
		}
		
		return returnTimeout;
	}
	
	this.console(response.text);
	
	for (let i=0; i<choices.length; i++) {
		let match = response.text === choices[i].text.toLowerCase() || (choices[i].matches && choices[i].matches.indexOf(response.text) > -1);
		if (match) {
			return {
				index: i,
				text: choices[i].text,
				value: choices[i].value
			};
		}
		else {
			// debugger;
		}
	}
	
	// debugger;
	
	const returnUnrecognized = {
		error: UNRECOGNIZED
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

export default choose;