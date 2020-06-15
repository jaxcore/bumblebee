const Jaxcore = require('jaxcore');

class BumblebeeProtocol extends Jaxcore.Client {
	constructor() {
		debugger;
		super(...arguments);
		
		// const {bumblebee} = this.devices;
		//
		// this.addEvents(bumblebee, {
		// 	recognize: function (text, stats) {
		//
		// 	}
		// });
	}
	
	async launchApp(AppClass) {
	
	}
	
	async launchAssistant(AssistantClass) {
		debugger;
		
		// jaxcore.addAdapter('custom-spin-adapter', customSpinAdapterClass);
		//
		// jaxcore.defineAdapter('CustomSpinAdapterClass', {
		// 	adapterType: 'custom-spin-adapter',
		// 	deviceType: 'spin'
		// });
		//
		// jaxcore.on('device-connected', function (type, device) {
		// 	if (type === 'bumblebee') {
		//
		// 	}
		// 	debugger;
		//
		// 	// if (type === 'websocketSpin') {
		// 	// 	const spin = device;
		// 	//
		// 	// 	console.log('connected', spin);
		// 	//
		// 	// 	jaxcore.connectAdapter(spin, 'CustomSpinAdapterClass', function (err, adapter) {
		// 	// 		if (err) {
		// 	// 			console.log('adapter error', e);
		// 	// 		} else {
		// 	// 			console.log('adapter created', adapter);
		// 	// 			if (onAdapterCreated) onAdapterCreated(adapter);
		// 	// 		}
		// 	// 	});
		// 	// } else {
		// 	// 	//console.log('device-connected', type);
		// 	// }
		// });
	}
	
}


module.exports = BumblebeeProtocol;