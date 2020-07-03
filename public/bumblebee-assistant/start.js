const Bumblebee = require('jaxcore-bumblebee');
const BumblebeeAssistant = require('./BumblebeeAssistant');

async function connect() {
	console.log('connecting...');
	
	try {
		const api = await Bumblebee.connect({
			timeout: 3000
		});
		
		const assistant = Bumblebee.launchAssistant(api, BumblebeeAssistant, {
			hotword: 'bumblebee',
			autoStart: true,
			timeout: 3000
		});
		
		console.log('assistant connected', typeof assistant);
	}
	catch(e) {
		if (e.timeout) {
			console.log('Trying again...');
			setTimeout(connect, 3000);
		}
		else {
			console.log('Bumblebee assistant error:', e);
			process.exit();
		}
	}
}

connect();