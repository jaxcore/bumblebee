const Application = require('./Application');

class Assistant extends Application {
	constructor() {
		super(...arguments);
		
		this._exitingAssistant = false;
		
		this.addEvents(this.services.bumblebee, {
			systemMessage: function (message) {
				if (typeof this.systemMessage === 'function') {
					this.systemMessage(message);
				}
			},
			exitAssistant: function () {
				this._exitingAssistant = true;
				this.abort();
			},
			hotword: function(hotword) {
				if (this._exiting) return;
				if (typeof this.onHotword === 'function') {
					this.onHotword(hotword);
				}
			},
			command: function(recognition) {
				if (this._exiting) return;
				if (typeof this.onCommand === 'function') {
					this.onCommand(recognition);
				}
			},
		});
	}
}

module.exports = Assistant;