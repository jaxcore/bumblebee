const Bumblebee = require('jaxcore-bumblebee');
const {makeReplacements, parseInteger} = Bumblebee;
const robot = require('robotjs');

const mouseReplacements = {
	'mouse': 'rose|nose|mount|most|mollie|mos|mose|malise|morison|mouth',
	'mouse up': 'mouse of',
	'scroll': 'rolled|scrolled|stroll|strolled|scrawled|scrawl',
	'left': 'laughed',
	'right': 'write|rated|rate|rat',
	'click': 'collick'
};

class MouseControlApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
	}
	
	async onBegin() {
		await this.playSound('hail');
		await this.say('Mouse voice control activated');
	}

	async loop() {
		
		let recognition = await this.recognize();
		this.log('raw', recognition.text);
		let text = makeReplacements(recognition.text, mouseReplacements);
		this.log('replace', text);
		
		this.console({
			type: 'stt',
			text
		});
		
		await this.processMouseCommands(text);
	}
	
	async processMouseCommands(text) {
		if (text === 'page up') {
			this.console('page up');
			robot.keyTap('pageup');
			await this.playSound('up');
		}
		else if (text === 'page down') {
			this.console('page down');
			robot.keyTap('pagedown');
			await this.playSound('down');
		}
		else if (text === 'up') {
			this.console('arrow up');
			robot.keyTap('up');
			await this.playSound('up');
		}
		else if (text === 'down') {
			this.console('arrow down');
			robot.keyTap('down');
			await this.playSound('down');
		}
		else if (text === 'left') {
			this.console('arrow left');
			robot.keyTap('left');
			await this.playSound('up');
		}
		else if (text === 'right') {
			this.console('arrow right');
			robot.keyTap('right');
			await this.playSound('down');
		}
		else if (text === 'scroll up') {
			this.console('scroll up');
			robot.scrollMouse(0, 200);
			await this.playSound('up');
		}
		else if (text === 'scroll down') {
			this.console('scroll down');
			robot.scrollMouse(0, -200);
			await this.playSound('down');
		}
		else if (text === 'right click' || text === 'mouse right click') {
			this.console('right click');
			robot.mouseClick('right');
			await this.playSound('click');
		}
		else if (text === 'click' || text === 'left click' || text === 'mouse click') {
			this.console('left click');
			robot.mouseClick('left');
			await this.playSound('select');
		}
		else if (text === 'middle click') {
			this.console('middle click');
			robot.mouseClick('middle');
			await this.playSound('okay');
		}
		else {
			let m;
			if (m = text.match(/^([a-z]+ )?(up|down|left|right) (.*)/)) {
				this.log('match', m);
				let command = m[1]? m[1].trim() : '';
				let dir = m[2];
				let num = parseInteger(m[3]);
				if (num !== null) {
					if (command === 'scroll' || command === 'scrolled') {
						await this.scrollMouse(dir, num);
					}
					else {  // if (command === 'mouse' || !command) {
						await this.moveMouse(dir, num);
					}
				}
				else {
					this.log('no num', m[1]);
				}
			}
			else if (m = text.match(/^(up|down|left|right) (.*)/)) {
				let dir = m[1];
				let num = parseInteger(m[2]);
				await this.moveMouse(dir, num);
			}
			else {
				this.log('no match');
			}
		}
	}
	
	async moveMouse(dir, num) {
		let pos = robot.getMousePos();
		let x = pos.x;
		if (dir === 'left') x -= num;
		if (dir === 'right') x += num;
		let y = pos.y;
		if (dir === 'up') y -= num;
		if (dir === 'down') y += num;
		this.console('move mouse '+dir+' '+num);
		
		// play start sound
		if (dir === 'left' || dir === 'up') await this.playSound('up');
		else await this.playSound('down');
		
		robot.moveMouseSmooth(x, y); // moveMouseSmooth is synchronous and locks up the script
		
		// play stop sound
		if (dir === 'left' || dir === 'up') await this.playSound('down');
		else await this.playSound('up');
	}
	
	async scrollMouse(dir, num) {
		let x = 0;
		let y = 0;
		if (dir === 'left') x -= num;
		if (dir === 'right') x += num;
		if (dir === 'up') y -= num;
		if (dir === 'down') y += num;
		this.console('scroll mouse '+dir+' '+num);
		robot.scrollMouse(-x, -y);
		if (dir === 'left' || dir === 'up') await this.playSound('up');
		else await this.playSound('down');
	}
}


Bumblebee.connectApplication(MouseControlApp, {
	name: "Mouse Control",
	autoStart: true
});