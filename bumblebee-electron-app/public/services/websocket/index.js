module.exports = {
	services: {
		websocketServer: {
			service: require('./bumblebee-websocket-service'),
			storeType: 'client'
		}
	},
	adapters: {
		// websocketServer: require('./websocket-adapter')
	}
};