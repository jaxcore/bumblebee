import Bumblebee from 'jaxcore-bumblebee';
import Color from 'ts-color-class';

const {makeReplacements, parseInteger, numberize} = Bumblebee;
global.numberize = numberize;
global.parseInteger = parseInteger;

const colorNames = Color.getNames();

function parseIntegers(text) {
	return numberize(text).split(/ +/)
	.map(n => {
		if (/^(\d+)$/.test(n)) {
			return parseInt(n);
		}
		else return n;
	});
}


class TurtleVoiceApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
	}
	
	init(turtleCanvas) {
		this.say('Welcome to Turtle Draw');
	}
	
	async onBegin() {
	}
	
	async onEnd() {
		await this.say('exiting turtle draw');
	}
	
	async loop() {
		let recognition = await this.recognize();
		this.console(recognition);
		let text = recognition.text;
		
		if (text === 'up' ||
			text === 'down' ||
			text === 'left' ||
			text === 'right'
		) {
			await this.playSound('select');
			this.emit('turnTowards', text);
		}
		
		else if (text === 'let' || text === 'laugh') {
			await this.playSound('select');
			this.emit('turnTowards', 'left');
		}
		
		else if (text === 'turn left' || text === 'rotate left' || text === 'counter clockwise' || text === 'counterclockwise') {
			await this.playSound('select');
			this.emit('procedure', 'left', 90);
		}
		else if (text === 'turn right' || text === 'rotate right' || text === 'clockwise') {
			await this.playSound('select');
			this.emit('procedure', 'right', 90);
		}
		else if (text === 'and') {
			const yes = await this.confirm('Do you want to undo your last command?');
			if (yes) {
				this.emit('undo');
				await this.playSound('okay');
			}
		}
		else if (text === 'redo' || text === 'read you') {
			await this.playSound('okay');
			this.emit('redo');
		}
		else if (text === 'undo' || text === 'undue' || text === 'and') {
			await this.playSound('okay');
			this.emit('undo');
		}
		
		else if (text === 'replay' || text === 'we play' || text === 'i play') {
			await this.playSound('okay');
			this.emit('replay');
		}
		else if (text === 'clear' || text === 'restart') {
			await this.askClear();
		}
		else {
			text = makeReplacements(text, {
				'left': 'laughed|laugh|lacked'
			});
			
			let numberizedWords = parseIntegers(text);
			
			let numberizedText = numberize(text);
			
			let m;
			if (numberizedWords.length === 1 && typeof numberizedWords[0] === 'number') {
				let integerText = numberizedWords[0];
				this.playSound('down');
				this.emit('procedure', 'move', integerText);
			}
			else if (m = numberizedText.match(/^(set roughness|roughness|a roughness|at roughness) (\d+)$/)) {
				let num = m[2];
				this.emit('procedure', 'setRoughness', num);
				this.playSound('okay');
				this.say('Roughness set to ' + num);
			}
			else if (m = numberizedText.match(/^(set color|color|at color) (.*)/)) {
				let color = m[2];
				if (color in colorNames) {
					this.emit('procedure', 'setColor', color);
					this.playSound('okay');
					this.say('Color set to ' + color);
				}
			}
			else if (m = numberizedText.match(/^(set width|width|set size|size|at size) (\d+)$/)) {
				let num = parseInt(m[2]);
				this.emit('procedure', 'setWidth', num);
				this.playSound('okay');
				this.say('Draw width set to ' + num);
			}
			// deepspeech has trouble with "opacity"
			else if (m = numberizedText.match(/^(set opacity|sat opacity|opacity|at capacity|set of pasty|set a past teeth|set or pass it|at opacity|set a pasty|set a parity|pasty|to pass teeth) (\d+) (percent|per cent)/)) {
				let num = parseInt(m[2]);
				this.emit('procedure', 'setOpacity', num / 100);
				this.playSound('okay');
				this.say('Opacity set to ' + num + ' percent');
			}
			else if (m = text.match(/^(set drawing|drawing|at drawing|sat drawing) (on|off|enabled|disabled)$/)) {
				let enabled = (m[2] === 'on' || m[2] === 'enabled');
				this.emit('procedure', 'setDrawing', enabled);
				this.playSound('okay');
				this.say('Drawing has been turned ' + (enabled ? 'on' : 'off'));
			}
			else if (m = numberizedText.match(/^move (\d+)$/)) {
				let num = parseInt(m[1]);
				this.playSound('down');
				this.emit('procedure', 'move', num);
			}
			else if (m = numberizedText.match(/^(move |moved )?(up|down|left|right) (\d+)$/)) {
				let dir = m[2];
				let num = parseInt(m[3]);
				if (num !== null) {
					this.playSound('select');
					this.emit('turnTowards', dir);
					this.emit('procedure', 'move', num);
					this.once('procedures-complete', () => {
						this.playSound('down');
					});
				}
			}
			else if (m = numberizedText.match(/^(turn|rotate) (up|down|left|right|clockwise|counterclockwise|counter clockwise) (\d+)/)) {
				this.log('match', m);
				let command = m[1] ? m[1].trim() : '';
				let dir = m[2];
				let num = parseInteger(m[3]);
				if (num !== null) {
					if (command === 'turn' || command === 'rotate') {
						if (dir === 'counterclockwise' || dir === 'counter clockwise') dir = 'left';
						if (dir === 'clockwise') dir = 'right';
						if (dir === 'left' || dir === 'right') {
							this.playSound('up');
							this.emit('procedure', dir, num);
						}
					}
				}
				else {
				
				}
			}
			else {
				// debugger;
			}
		}
	}
	
	async askClear() {
		let yes = await this.confirm('Are you sure you want to clear and restart your drawing?');
		if (yes) {
			this.emit('clear');
			await this.playSound('okay');
		}
		else {
			await this.playSound('deny');
		}
	}
}

export default TurtleVoiceApp;