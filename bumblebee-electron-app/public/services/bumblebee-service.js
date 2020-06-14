// const Jaxcore = require('jaxcore');
// const {Service, createClientStore, createLogger} = Jaxcore;
//
// const ipcMain = require('electron').ipcMain;
//
// const schema = {
// 	id: {
// 		type: 'string'
// 	},
// 	connected: {
// 		type: 'boolean'
// 	}
// };
//
// let serviceInstance;
//
// class BumblebeeService extends Service {
// 	constructor(defaults, store) {
// 		super(schema, store, defaults);
// 		this.log = createLogger('BumblebeeService');
// 		this.log('create', this.state);
// 	}
//
// 	init(jaxcore) {
// 		ipcMain.on('simulator-spin-close', (event, id) => {
//
// 		});
// 	}
//
// 	connect() {
// 		if (!this.state.connected) {
// 			this.setState({
// 				connected: true
// 			});
// 			this.emit('connect');
// 		}
// 	};
//
//
// 	destroy() {
// 		this.emit('teardown');
// 		debugger;
// 	}
//
// 	static id() {
// 		return 'BumblebeeService';
// 	}
//
// 	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
// 		console.log('BumblebeeService getOrCreateInstance', serviceId, serviceConfig);
// 		if (serviceInstance) {
// 			callback(null, serviceInstance, false);
// 		}
// 		else {
// 			console.log('getOrCreateInstance BumblebeeService', serviceConfig);
// 			serviceConfig = {
// 				id: 'simulatorService'
// 			};
// 			serviceInstance = new BumblebeeService(serviceConfig, serviceStore);
//
// 			console.log('CREATED serviceInstance', serviceInstance);
//
// 			callback(null, serviceInstance, true);
// 		}
// 	}
//
// }
//
//
//
//
//
// module.exports = BumblebeeService;