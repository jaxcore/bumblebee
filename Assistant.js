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
		
		this.addEvents(this.bumblebee, {
			hotword: function(hotword) {
				if (this._exitingAssistant) return;
				this.emit('hotword', hotword);
			},
			command: function(recognition) {
				if (this._exitingAssistant) return;
				this.emit('command', recognition);
			}
		});
		
		/*
		console.log('starting loop');
					let loopResult = loop();await this.loop();
					if (loopResult) {
						console.log('loop returned', loopResult);
					}
					else {
					
					}
					
					// console.log('main returned', r);
					bumblebee.say('bumblebee main returned').then(() => {
						bumblebee.returnValue(r);
					})
					
		 */
		
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
			main: function (args) {
				console.log('main');
				this.main(args)
				.then(mainReturn => {
					if (mainReturn) {
						console.log('main returned', mainReturn);
						if (this.onBeforeExit) {
							this.onBeforeExit(null, mainReturn).then(() => {
								bumblebee.returnValue(mainReturn);
							});
						}
						else {
							bumblebee.returnValue(mainReturn);
						}
						return mainReturn;
					}
					else if (this.loop) {
						return looper();
					}
					else return false;
				})
				.then(loopReturn => {
					console.log('loop returned', loopReturn);
					if (this.onBeforeExit) {
						this.onBeforeExit(null, loopReturn).then(() => {
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
						if (this.onBeforeExit) {
							this.onBeforeExit(e).then(() => {
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
			hotword: function (hotword) {
				this.log('bumblebee hotword:', hotword);
				bumblebee.console('hotword detected');
			},
			command: function (text, stats) {
				this.log('bumblebee command:', text, stats);
				// bumblebee.console({
				// 	type: 'command',
				// 	text,
				// 	stats
				// });
			},
			recognize: function (text, stats) {
				// this.log('bumblebee recognize:', text, stats);
				// bumblebee.console({
				// 	type: 'stt',
				// 	text,
				// 	stats
				// });
			}
		});
		
		this.on('teardown', function () {
			debugger;
		});
	}
	
	async abort(r) {
		if (this.onBeforeExit) {
			await this.onBeforeExit(null, r);
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