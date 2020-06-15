// const Jaxcore = require('jaxcore');
//
// const schema = {
// 	id: {
// 		type: 'string',
// 		defaultValue: 'speech'
// 	},
// 	connected: {
// 		type: 'boolean',
// 		defaultValue: false
// 	},
// 	hotword: {
// 		type: 'string',
// 		defaultValue: null
// 	},
// 	hotwordActive: {
// 		type: 'boolean',
// 		defaultValue: false
// 	},
// 	// recording: {
// 	// 	type: 'boolean',
// 	// 	defaultValue: false
// 	// },
// 	// muted: {
// 	// 	type: 'boolean',
// 	// 	defaultValue: false
// 	// }
// };
//
// let bumblebeeInstances;
//
// class BumblebeeDevice extends Jaxcore.Client {
// 	constructor(defaults, store, jaxcore, bbWebsocketClient) {
// 		// const store = Jaxcore.createServiceStore('BumblebeeDevice');
// 		super(schema, store, defaults);
//
// 		this.log = Jaxcore.createLogger('BumblebeeDevice');
// 		this.log('create', defaults);
//
// 		this.deviceType = 'bumblebee';
//
// 		this.jaxcore = jaxcore;
// 		this.bbWebsocketClient = bbWebsocketClient;
//
// 		debugger;
// 	}
//
// 	connect() {
// 		if (!this.state.connected) {
// 			debugger;
// 			this.setState({connected: true});
// 			this.emit('connect');
// 		}
// 	}
//
// 	disconnect() {
// 		if (this.state.connected) {
// 			debugger;
// 			this.setState({connected: false});
// 			this.emit('disconnect');
// 		}
// 	}
//
// 	async launchApp(AppClass) {
// 		debugger;
// 	}
//
// 	async launchAssistant(hotword, AssistantClass) {
// 		debugger;
// 	}
//
// 	destroy() {
// 		this.disconnect();
// 	}
//
// 	static startJaxcoreDevice(config, store, callback, extraOptions) {
// 		console.log('startJaxcoreDevice bumblebee: ', config);
//
// 		const id = BumblebeeDevice.id(serviceConfig);
//
// 		if (bumblebeeInstances[id]) {
// 			console.log('bumblebeeInstance exists', id);
// 			debugger;
// 		}
// 		else {
// 			bumblebeeInstance[id] = new BumblebeeDevice({
// 				id,
// 				websocketId: serviceConfig.websocketId
// 			}, store, extraOptions.jaxcore, extraOptions.bbWebsocketClient);
//
// 			// bumblebeeInstance.once('connect', () => {
//
// 			bumblebeeInstance[id].once('connect', () => {
// 				callback(bumblebeeInstance);
// 			});
//
// 			bumblebeeInstance[id].connect();
// 		}
// 	}
//
// 	static getDeviceInstance(serviceConfig) {
// 		const id = BumblebeeDevice.id(serviceConfig);
// 		return bumblebeeInstances[id];
// 	}
//
// 	static id(serviceConfig) {
// 		return 'BumblebeeDevice:'+serviceConfig.websocketId;
// 	}
// }
//
// module.exports = BumblebeeDevice;