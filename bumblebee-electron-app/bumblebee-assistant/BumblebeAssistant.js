// const BumblebeeAPI = require('../../api');
//
// class BumblebeeAssistant extends BumblebeeAPI.Assistant {
// 	constructor() {
// 		debugger;
// 		super(...arguments);
// 		debugger;
// 	}
// }
//
// module.exports = BumblebeeAssistant;

const Jaxcore = require('jaxcore');

class App extends Jaxcore.Adapter {
	constructor() {
		debugger;
		super(...arguments);
		
		console.log('services', this.services);
		
		const bumblebee = this.services.bbWebsocketClient;
		
		this.addEvents(bumblebee, {
			activeApp: function(appName) {
				console.log('activeApp', appName);
				debugger;
				if (appName === 'main') {
					let r = this.main();
					console.log('main r', r);
					return;
				}
				else {
					process.exit();
				}
			},
			hotword: function(hotword) {
				this.log('bumblebee hotword:', hotword);
				bumblebee.console('hotword detected');
			},
			command: function(text, stats) {
				this.log('bumblebee command:', text, stats);
				bumblebee.console({
					type: 'command',
					text,
					stats
				});
			},
			recognize: function(text, stats) {
				this.log('bumblebee recognize:', text, stats);
				bumblebee.console({
					type: 'stt',
					text,
					stats
				});
			}
		});
		
		this.on('teardown', function() {
			debugger;
		})
	}
	
	async main(args) {
		const bumblebee = this.services.bbWebsocketClient;
		// bumblebee.setActiveApp('main');

		console.log('main');
		
		// const r = await bumblebee.recognizeAny();
		bumblebee.console('Bumblebee Main Menu');
		bumblebee.say('Bumblebee Ready');
		
	}
}

module.exports = App;