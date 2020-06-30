const Jaxcore = require('jaxcore');

class Application extends Jaxcore.Adapter {
	constructor() {
		super(...arguments);
		
		const bumblebee = this.services.bumblebee;
		this.bumblebee = bumblebee;
		
		this._exiting = false;
		
		const looper = async (arg) => {
			// console.log('looper()', arg);
			let loopReturn = await this.loop(arg);
			if (loopReturn === false) {
				// console.log('looper returned false', loopReturn);
				return loopReturn;
			}
			else if (this._didAbortReturn) {
				return this._didAbortReturn.returnValue;
			}
			// else if (this._didAbortError) {
			//
			// }
			else {
				return looper(loopReturn);
			}
		}
		
		this.addEvents(bumblebee, {
			// systemMessage: function (message) {
			// 	if (typeof this.systemMessage === 'function') {
			// 		this.systemMessage(message);
			// 	}
			// },
			// hotword: function(hotword) {
			// 	if (this._exiting) return;
			// 	if (typeof this.onHotword === 'function') {
			// 		this.onHotword(hotword);
			// 	}
			// },
			// command: function(recognition) {
			// 	if (this._exiting) return;
			// 	if (typeof this.onCommand === 'function') {
			// 		this.onCommand(recognition);
			// 	}
			// },
			start: function (args) {
				// console.log('main');
				this.onBegin(args)
				.then(startReturn => {
					if (startReturn === false) {
						console.log('main returned', startReturn);
						return startReturn;
					}
					else if (this.loop) {
						return looper(startReturn);
					}
					else return false;
				})
				.then(loopReturn => {
					
					delete this._didAbortReturn;
					// delete this._didAbortError;
					
					// console.log('loop returned', loopReturn);
					if (this.onEnd) {
						this.onEnd(null, loopReturn).then(() => {
							bumblebee.returnValue(loopReturn);
						});
					}
					else {
						bumblebee.returnValue(loopReturn);
					}
				})
				.catch(e => {
					if (e.aborted) {
						if (e.aborted === 'abort-return') {
							if (this.onEnd) {
								this.onEnd(null, e.returnValue).then(() => {
									bumblebee.returnValue(e.returnValue);
								});
							}
							else {
								bumblebee.returnValue(e.returnValue);
							}
						}
						if (e.aborted === 'abort-error') {
							if (this.onEnd) {
								this.onEnd(e.errorValue).then(() => {
									bumblebee.returnError(e.errorValue);
								});
							}
							else {
								bumblebee.returnError(e.errorValue);
							}
						}
						// console.log('main aborting', e);
						this._exiting = false;
					}
					else {
						console.log('main error', e);
						if (this.onEnd) {
							this.onEnd(e).then(() => {
								bumblebee.returnError(e);
							});
						}
						else {
							bumblebee.returnError(e);
						}
					}
					
				});
			},
		});
		
		this.on('teardown', function() {
			// todo: not working
			console.log('teardown')
			process.exit();
		});
		
	}
	
	return(r) {
		// if (this.onEnd) {
		// 	await this.onEnd(null, r);
		// }
		this._didAbortReturn = {
			returnValue: r
		};
		// this.bumblebee.emit('abort-recognize', 'abort-return', null, r);
		// this.bumblebee.returnValue(r);
	}
	
	async abort(e) {
		// todo
		// if (this.onEnd) {
		// 	await this.onEnd(e);
		// }
		// this._didAbortError = {
		// 	errorValue: e
		// };
		
		this.bumblebee.emit('abort-recognize', 'abort-error', e, null);
		
		// this.bumblebee.returnError(e);
	}
	
	async run(appId, args, options) {
		return this.bumblebee.runApplication(appId, args, options);
	}
}

module.exports = Application;