const Bumblebee = require('jaxcore-bumblebee');
const {makeReplacements, numberize} = Bumblebee;
const robot = require('robotjs');

const directionReplacements = {
	'option left': 'alt left',
	'option right': 'alt down',
	'option up': 'alt up',
	'option down': 'alt down',
	'shift option left': 'option shift left|shift alt left|alt shift left',
	'shift option right': 'option shift right|shift alt right|alt shift right',
	'shift option up': 'option shift up|shift alt up|alt shift up',
	'shift option down': 'option right down|shift alt down|alt shift down',
};

const exactReplacements = {
	'three': ['the', 'there'],
	'five': ['for i\'ve'],
	'eight': ['eat', 'at'],
	'nine': ['now i\'m']
};
const numberReplacements = {
	'two': 'to',
	'four': 'for',
	'.': 'point|dot|dat|decimal|dismal|dark|dart',
	'[': 'left brace',
	']': 'right brace',
	'{': 'left curly brace',
	'}': 'right curly brace',
	'(': 'left bracket',
	')': 'right bracket',
	'=': 'equals|equal',
	'+': 'plus|add',
	'-': 'negative|dash|minus',
	'*': 'times|multiplied by',
	'\\': 'back slash',
	'/': 'divide by|divided by|slash',
	';': 'semi colon',
	':': 'colon|collin|colin|cool and',
	',': 'comma',
	'escape': 'clear',
	'backspace': 'back space|back face|back skates|back pace|back base|back stays|backstays|max face',  // DS has trouble with back space
	'tab': 'tom|tad',
	'>': 'greater than',
	'<': 'less than',
};

function parseNumbers(text) {
	text = makeReplacements(text, numberReplacements);
	return numberize(text);
}

function makeExactReplacements(text, corrections) {
	for (let key in corrections) {
		for (let i = 0; i < corrections[key].length; i++) {
			if (text === corrections[key][i]) {
				return key;
			}
		}
	}
	return text;
}

const keywords = ['space','escape','tab','enter','return','delete','backspace','home','end','left','right','up','down'];
const commandComboWords = {
	'hold shift': {
		hold: 'shift'
	},
	'release shift': {
		release: 'shift'
	},
	'select all': {
		key: 'a',
		modifiers: ['control'],
		modifiersDarwin: ['command']
	},
	'copy': {
		key: 'c',
		modifiers: ['control'],
		modifiersDarwin: ['command']
	},
	'paste': {
		key: 'v',
		modifiers: ['control'],
		modifiersDarwin: ['command']
	},
	'shift option left': {
		key: 'left',
		modifiers: ['shift', 'alt']
	},
	'shift option right': {
		key: 'right',
		modifiers: ['shift', 'alt']
	},
	'shift option up': {
		key: 'up',
		modifiers: ['shift', 'alt']
	},
	'shift option down': {
		key: 'down',
		modifiers: ['shift', 'alt']
	},
	'shift left': {
		key: 'left',
		modifiers: ['shift']
	},
	'shift right': {
		key: 'right',
		modifiers: ['shift']
	},
	'shift up': {
		key: 'up',
		modifiers: ['shift']
	},
	'shift down': {
		key: 'down',
		modifiers: ['shift']
	},
	'option left': {
		key: 'left',
		modifiers: ['alt']
	},
	'option right': {
		key: 'right',
		modifiers: ['alt']
	},
	'option up': {
		key: 'up',
		modifiers: ['alt']
	},
	'option down': {
		key: 'down',
		modifiers: ['alt']
	},
	'command left': {
		key: 'left',
		modifiers: ['command']
	},
	'command right': {
		key: 'right',
		modifiers: ['command']
	},
	'command up': {
		key: 'up',
		modifiers: ['command']
	},
	'command down': {
		key: 'down',
		modifiers: ['command']
	},
	'control left': {
		key: 'left',
		modifiers: ['control']
	},
	'control right': {
		key: 'right',
		modifiers: ['control']
	},
	'control up': {
		key: 'up',
		modifiers: ['control']
	},
	'control down': {
		key: 'down',
		modifiers: ['control']
	}
};

function parseWord(keys, word) {
	if (keywords.indexOf(word) > -1) {
		if (word === 'return') word = 'enter';
		keys.push({
			key: word
		});
	}
	else if (/^[\d|\+|\-|\=|\/|\*|\.|,| ]+$/.test(word)) {
		word.split('').forEach(char => {
			keys.push({
				key: char
			});
		});
	}
	else if (/^[\]|\[|{|}|\(|\)|\;|\:,|<|>]+$/.test(word)) {
		word.split('').forEach(char => {
			keys.push({
				typeString: char
			});
		});
	}
}

function processComboWord(keys, combo, text) {
	while (text.indexOf(combo) > -1) {
		let index = text.indexOf(combo);
		if (index > 0) {
			let words = text.substring(0, index);
			processComboWords(keys, words);
		}
		
		keys.push(commandComboWords[combo]);
		text = text.substring(index + combo.length + 1).trim();
	}
	return text;
}

function processComboWords(keys, text) {
	for (let combo in commandComboWords) {
		text = processComboWord(keys, combo, text);
	}
	text.split(' ').forEach(word => {
		parseWord(keys, word);
	});
}

function parseKeys(text) {
	let keys = [];
	console.log('\nRaw text:', text);
	text = makeExactReplacements(text, exactReplacements);
	text = parseNumbers(text);
	text = makeReplacements(text, directionReplacements);
	console.log('Processed text:', text);
	processComboWords(keys, text);
	console.log('Processed keys:', keys);
	return keys;
}

function isMac() {
	return process.platform === 'darwin';
}

class NumberPadApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
	}

	async onBegin() {
		await this.say("Voice Number Pad activated");
	}
	
	async loop() {
		let recognition = await this.recognize();
		this.processNumberKeys(recognition.text);
	}
	
	async processNumberKeys(text) {
		let keys = parseKeys(text);
		
		for (const key of keys) {
			if (key.key) {
				if (key.modifiers) {
					await this.playSound('click');
					if (key.modifiersDarwin && isMac()) robot.keyTap(key.key, key.modifiersDarwin);
					else robot.keyTap(key.key, key.modifiers);
					this.setState({  // eg. release shift after paste
						modifierHold: null
					});
					this.console('key: '+key.key+' + '+key.modifiers.join(','));
				}
				else if (this.state.modifierHold) {
					await this.playSound('click');
					robot.keyTap(key.key, [this.state.modifierHold]);
					this.console('key: '+key.key+' + '+this.state.modifierHold);
				}
				else {
					// play different sounds for equals, numbers, and other keys
					if (key.key === 'enter' || key.key === '=') await this.playSound('okay');
					else if (/\d/.test(key.key)) await this.playSound('click');
					else await this.playSound('select');
					
					robot.keyTap(key.key);
					this.console('key: '+key.key);
				}
			}
			else if (key.typeString) {
				await this.playSound('click');
				robot.typeString(key.typeString);
				this.console('type: '+key.typeString);
			}
			else if (key.hold) {
				this.console('hold: '+key.hold);
				this.setState({
					modifierHold: key.hold
				});
			}
			else if (key.release) {
				this.console('release: '+key.hold);
				this.setState({
					modifierHold: null
				});
			}
		}
	}
}

Bumblebee.connectApplication(NumberPadApp, {
	name: "Number Pad",
	autoStart: true
});