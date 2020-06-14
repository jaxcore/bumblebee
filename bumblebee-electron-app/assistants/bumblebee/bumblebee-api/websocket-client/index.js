module.exports = {
	devices: {
		// bumblebee: {
		// 	device: require('./websocket-bumblebee-device'),
		// 	storeType: 'service'
		// }
	},
	services: {
		bbWebsocketClient: {
			service: require('./bumblebee-websocket-client'),
			storeType: 'client'
		}
	}
};
