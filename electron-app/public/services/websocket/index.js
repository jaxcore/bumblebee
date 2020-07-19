module.exports = {
	services: {
		bbWebsocketServer: {
			service: require('./bumblebee-websocket-server'),
			storeType: 'client'
		}
	},
	adapters: {
		bbWebsocketServer: require('./bumblebee-websocket-adapter')
	}
};