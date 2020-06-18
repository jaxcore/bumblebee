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
		
		this.addEvents(bumblebee, {
			main: function (args) {
				console.log('main');
				this.main(args)
				.then(r => {
					console.log('main returned', r);
					bumblebee.say('bumblebee main returned').then(() => {
						bumblebee.returnValue(r);
					})
					
				})
				.catch(e => {
					console.log('main error', e);
					bumblebee.returnError(e);
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
				bumblebee.console({
					type: 'command',
					text,
					stats
				});
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
}

module.exports = Assistant;