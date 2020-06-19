// Aconst App = require('./App');
//
// class Assistant extends App {
// 	constructor() {
// 		debugger;
// 		super(...arguments);
// 	}
// }

const Jaxcore = require('jaxcore');

class Assistant extends Jaxcore.Adapter {
	constructor() {
		// debugger;
		super(...arguments);
		
		console.log('services', this.services);
		
		const bumblebee = this.services.bumblebee;
		this.bumblebee = bumblebee;
		
		this._exitingAssistant = false;
		
		const looper = async () => {
			console.log('looper()');
			
			let loopReturn = await this.loop();
			// while (!loopReturn) {
			// 	console.log('this.loop() returned', loopReturn);
			// }
			if (!loopReturn) return looper();
			
			console.log('looper returned', loopReturn);
			return loopReturn;
		}
		
		this.addEvents(bumblebee, {
			hotword: function(hotword) {
				if (this._exitingAssistant) return;
				// this.emit('hotword', hotword);
				if (typeof this.onHotword === 'function') {
					this.onHotword(hotword);
				}
			},
			command: function(recognition) {
				if (this._exitingAssistant) return;
				// this.emit('command', recognition);
				if (typeof this.onCommand === 'function') {
					this.onCommand(recognition);
				}
			},
			start: function (args) {
				console.log('main');
				// this.main(args)
				this.onStart(args)
				.then(startReturn => {
					if (startReturn) {
						console.log('main returned', startReturn);
						if (this.onStop) {
							this.onStop(null, startReturn).then(() => {
								bumblebee.returnValue(startReturn);
							});
						}
						else {
							bumblebee.returnValue(startReturn);
						}
						return startReturn;
					}
					else if (this.loop) {
						return looper();
					}
					else return false;
				})
				.then(loopReturn => {
					console.log('loop returned', loopReturn);
					if (this.onStop) {
						this.onStop(null, loopReturn).then(() => {
							bumblebee.returnValue(loopReturn);
						});
					}
					else {
						bumblebee.returnValue(loopReturn);
					}
				})
				.catch(e => {
					if (e.aborted) {
						console.log('main aborting', e);
						if (this._exitingAssistant) {
							console.log('this._exitingAssistant complete');
						}
						this._exitingAssistant = false;
					}
					else {
						console.log('main error', e);
						if (this.onStop) {
							this.onStop(e).then(() => {
								bumblebee.returnError(e);
							});
						}
						else {
							bumblebee.returnError(e);
						}
					}
					
				});
			},
			// activeApp: function(appName) {
			// 	console.log('activeApp', appName);
			// 	debugger;
			// 	if (appName === 'main') {
			// 		let r = this.main();
			// 		console.log('main r', r);
			// 		return;
			// 	}
			// 	else {
			// 		process.exit();
			// 	}
			// },
			// hotword: function (hotword) {
			// 	this.log('bumblebee hotword:', hotword);
			// 	bumblebee.console('hotword detected');
			// },
			// command: function (text, stats) {
			// 	this.log('bumblebee command:', text, stats);
			// 	// bumblebee.console({
			// 	// 	type: 'command',
			// 	// 	text,
			// 	// 	stats
			// 	// });
			// },
			// recognize: function (text, stats) {
			// 	// this.log('bumblebee recognize:', text, stats);
			// 	// bumblebee.console({
			// 	// 	type: 'stt',
			// 	// 	text,
			// 	// 	stats
			// 	// });
			// }
		});
		
		this.on('teardown', function () {
			debugger;
		});
	}
	
	// async main() {
	// 	return this.onStart();
	// }
	
	// async loop() {
	// 	let recognition = await this.bumblebee.recognize();
	// 	return this.onRecognize(recognition);
	// }
	
	async abort(r) {
		if (this.onStop) {
			await this.onStop(null, r);
		}
		this.bumblebee.emit('abort-recognize', 'exit-assistant');
		this.bumblebee.returnValue(r);
	}
	
	
	// exitAssistant() {
	// 	this._exitingAssistant = true;
	// 	// this.bumblebee.exitAssistant();
	// 	this.bumblebee.emit('abort-recognize', 'exit-assistant');
	// }
}

module.exports = Assistant;