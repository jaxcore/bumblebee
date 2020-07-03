const Jaxcore = require('jaxcore');

class Application extends Jaxcore.Adapter {
	constructor() {
		super(...arguments);
		
		const bumblebee = this.services.bumblebee;
		// this.bumblebee = bumblebee;
		
		this._exiting = false;
		
		const looper = async (arg) => {
			// console.log('looper()', arg);
			let loopReturn = await this.loop(arg);
			// if (typeof loopReturn === 'object' && loopReturn._appAutoStart === true) {
			// 	console.log('loopReturn._appAutoStart');
			// 	process.exit();
			// }
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
			applicationAutostart: function (id, initialArgs) {
				console.log('application on application-autostart', id, initialArgs)
				this.emit('application-autostart', id, initialArgs);
			},
			applicationRemoved: function (id, options) {
				if (typeof this.onApplicationRemoved === 'function') {
					this.onApplicationRemoved(id, options);
				}
			},
			applicationAdded: function (id, options) {
				console.log('applicationAdded', id, options);
				if (typeof this.onApplicationAdded === 'function') {
					this.onApplicationAdded(id, options);
				}
				// if (options.autoStart) {
				// 	this.emit('application-autostart', id, options);
				// }
			},
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
					if (typeof e === 'object' && e._appAutoStart === true) {
						console.log('catch._appAutoStart', e);
						console.log('catch._appAutoStart', e);
						console.log('catch._appAutoStart', e);
						console.log('catch._appAutoStart', e);
						debugger;
						console.log('restarting loop, emit start');
						bumblebee.emit('start', args);
						// process.exit();
					}
					else if (e.aborted) {
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
	
	// onBegin is intended to be overwritten
	async onBegin() {
	}
	
	// onEnd is intended to be overwritten
	async onEnd() {
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
		
		this.emit('abort-recognize', 'abort-error', e, null);
		
		// this.bumblebee.returnError(e);
	}
	
	async run(appId, args, options) {
		return this.services.bumblebee.runApplication(appId, args, options);
	}
	
	async recognize(options) {
		this.log('recognize()', options);
		const bumblebee = this.services.bumblebee;
		if (!options) options = {};
		return new Promise((resolve, reject) => {
			let timedOut = false;
			let timer;
			
			const onTimedRecognize = (recognition) => {
				this.log('onTimedRecognize', recognition);
				removeEvents();
				clearTimeout(timer);
				if (timedOut) {
					this.log('onTimedRecognize too late', recognition);
				}
				else {
					resolve(recognition);
				}
			}
			
			const onRecognized = (recognition) => {
				this.log('onRecognized', recognition);
				removeEvents();
				clearTimeout(timer);
				resolve(recognition);
			};
			
			const autoStartHandler = (appId, initialArgs) => {
				console.log('on autoStartHandler', appId, initialArgs);
				
				removeEvents();
				clearTimeout(timer);
				debugger;
				this.run(appId, initialArgs)
				.then(r => {
					console.log('autoStartHandler return', r);
					debugger;
					reject({
						_appAutoStart: true
					});
					// resolve(r);
				})
				.catch(e => {
					console.log('autoStartHandler catch', e);
					debugger;
					if (e === 'app disconnected') {
						console.log('CAUGHT app disconnected throw _appAutoStart', e);
						reject({
							_appAutoStart: true
						});
					}
					else {
						reject(e);
					}
				});
				// reject({
				// 	_appAutoStart: true,
				// 	appId,
				// 	options
				// 	// runId,
				// 	// appInfo
				// });
			};
			
			const removeEvents = () => {
				if (options.timeout) {
					bumblebee.removeListener('recognize', onTimedRecognize);
				}
				else {
					bumblebee.removeListener('recognize', onRecognized);
				}
				this.removeListener('abort-recognize', abortHandler);
				this.removeListener('application-autostart', autoStartHandler);
			}
			
			const abortHandler = (reason, errorValue, returnValue) => {
				removeEvents();
				clearTimeout(timer);
				reject({
					aborted: reason,
					errorValue,
					returnValue
				});
			};
			
			this.once('application-autostart', autoStartHandler);
			
			this.once('abort-recognize', abortHandler);
			
			if (options.timeout) {
				timer = setTimeout(function () {
					timedOut = true;
					removeEvents();
					reject({
						error: {
							timedOut: true
						}
					});
				}, options.timeout);
				
				bumblebee.once('recognize', onTimedRecognize);
			}
			else {
				bumblebee.once('recognize', onRecognized);
			}
		});
	}
	
	console(data) {
		this.services.bumblebee._console(data);
	}
	
	async playSound(name, theme, onBegin) {
		return this.services.bumblebee._playSound(name, theme, onBegin);
	}
	
	async delay(delayTime, resolveValue) {
		return this.services.bumblebee._delay(delayTime, resolveValue);
	}
	
	async say(text, options) {
		if (!options) options = {};
		if (!options.profile && this._defaultSayProfile) options.profile = this._defaultSayProfile;
		return this.services.bumblebee._say(text, options);
	}
	
	setSayProfile(name) {
		this._defaultSayProfile = name;
	}
}

module.exports = Application;