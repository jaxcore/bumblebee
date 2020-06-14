const BumblebeeAPI = require('./bumblebee-api');

class MyVoiceAssistant extends BumblebeeAPI.Adapter {
	constructor() {
		super(...arguments);
		
		const {bumblebee} = this.devices;
		
		this.addEvents(bumblebee, {
			recognize: function (text, stats) {
			
			}
		});
	}
}

BumblebeeAPI.connect()
.then(api => {
	debugger;
	// api.launchAssistant(MyVoiceAssistant);
})
.catch(e => {
	console.log(e);
	process.exit();
});