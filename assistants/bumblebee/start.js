const BumblebeeAPI = require('../../api');
const BumblebeeAssistant = require('./BumblebeAssistant')

async function connect() {
	try {
		const api = await BumblebeeAPI.connect();
		// debugger;
		const assistant = await api.launchAssistant('bumblebee', BumblebeeAssistant);
		debugger;
		console.log('assistant', assistant);
	}
	catch(e) {
		console.error('BumblebeeAPI.connect()', e);
		process.exit();
	}
	
	// api => {
	// 	debugger;
	// 	.then(assistant => {
	// 		console.error('BumblebeeAPI.launchAssistant()', assistant);
	// 	})
	// 	.catch(e => {
	// 		console.error('BumblebeeAPI.launchAssistant()', e);
	// 		process.exit();
	// 	})
	// })
	// .catch(e => {
	//
	// });
}

connect();