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
		// this.addEvents(bumblebee, {
		// 	recognize: function
		// });
		
		this.on('teardown', function() {
			debugger;
		})
	}
}

module.exports = App;