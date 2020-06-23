const Jaxcore = require('jaxcore');

class BumbleBeeWebsocketAdapter extends Jaxcore.Adapter {
	
	constructor() {
		super(...arguments);
		const {bbWebsocketServer} = services;
		
		this.log('BumbleBeeWebsocketAdapter started', bbWebsocketServer);
		debugger;
		
		// this.addEvents(spin, {
		// 	update: function(changes) {
		// 		this.log('ws spin change', changes);
		// 		if (changes) websocketServer.spinUpdate(spin, changes);
		// 		else console.log('no changes??');
		// 	}
		// });
	}
}

module.exports = BumbleBeeWebsocketAdapter;
