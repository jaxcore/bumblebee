import Bumblebee from 'jaxcore-bumblebee';
const {makeReplacements, parseInteger, numberize} = Bumblebee;
global.numberize = numberize;

class TurtleVoiceApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
	}
	
	init(turtleCanvas) {
		this.turtleCanvas = turtleCanvas;
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
			let integerText = parseInteger(text);
			text = makeReplacements(text, {
				'left': 'laughed'
			});
			let numberizedText = numberize(text);
			
			let m;
			if (integerText !== null) {
				// await this.say('number '+integerText);
				this.playSound('down');
				this.emit('procedure', 'move', integerText);
			}
			else if (m = text.match(/^([a-z]+ )?(up|down|left|right)$/)) {
				await this.say('unfinished '+text);
				await this.playSound('click');
				debugger;
			}
			else if (m = numberizedText.match(/^move (\d+)$/)) {
				let num = parseInt(m[1]);
				this.playSound('down');
				this.emit('procedure', 'move', num);
			}
			else if (m = numberizedText.match(/^(move )?(up|down|left|right) (\d+)$/)) {
				let dir = m[2];
				let num = parseInteger(m[3]);
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