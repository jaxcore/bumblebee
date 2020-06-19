const {Client, createLogger} = require('jaxcore');
const http = require('http');
const socketIO = require('socket.io');

const schema = {
	id: {
		type: 'string',
		defaultValue: ''
	},
	connected: {
		type: 'boolean',
		defaultValue: false
	},
	port: {
		type: 'number',
		defaultValue: 0
	}
};

const websocketInstances = {};

class BumblebeeWebsocketServer extends Client {
	constructor(defaults, store) {
		super(schema, store, defaults);
		this.log = createLogger('BBServer');
		this.log('created');
		this._onConnect = this.onConnect.bind(this);
		this._onDisconnect = this.onDisconnect.bind(this);
		
		this.sockets = {};
	}
	
	connect() {
		this.app = http.createServer(function (req, res) {
			res.writeHead(200);
			res.write('bumblebee');
			res.end();
		});
		
		const options = Object.assign({}, this.state.options);
		
		this.io = socketIO(this.app, options);
		
		this.io.on('connection', this._onConnect);
		this.io.on('disconnection', this._onDisconnect);
		
		this.log('starting on port', this.state.port, options);
		
		this.server = this.app.listen(this.state.port, this.state.host, () => {
			this.log('Socket server listening on : ' + this.state.port);
			
			this.setState({
				connected: true
			});
			
			this.emit('connect');
		});
	}
	
	
	init(bumblebee, app, onSocketConnect, onSocketDisconnect) {
		this.app = app;
		this.bumblebee = bumblebee;
		this.onSocketConnect = onSocketConnect;
		this.onSocketDisconnect = onSocketDisconnect;
		
		// console.log('init', typeof app, typeof bumblebee);
		// bumblebee.connectWebsocketServer();
		// bumblebee.on('hotword', (hotword) => {
		// 	console.log('hotword', hotword)
		// 	if (hotword in this.app.state.assistants) {
		// 		this.setActiveAssistant(hotword);
		//
		// 		// const hotword = this.app.state.socketAssistants[socketId];
		// 	}
		// 	else {
		// 		debugger;
		// 	}
		//
		// })
		// debugger;
	}
	
	onConnect(socket) {
		this.log('Socket connected', socket.id, socket.handshake.headers.host, socket.handshake.headers['user-agent']);
		
		this.log('socket', socket.conn.remoteAddress);
		
		// '::ffff:192.168.1.29',
		if (this.state.allowClients && this.state.allowClients.length) {
			if (this.state.allowClients.indexOf(socket.conn.remoteAddress) === -1) { //} !== '::ffff:127.0.0.1') {
				this.log('invalid remote address', socket.conn.remoteAddress, 'allowed clients are:', this.state.allowClients);
				// this.log('socket', socket);
				// socket.disconnect();
				debugger;
				// process.exit();
				return;
			}
		}
		
		this.onSocketConnect(socket);
		
		socket.once('disconnect', () => {
			this.log('socket.once disconnected', socket.id);
			
			this.onSocketDisconnect(socket);
			
			delete this.sockets[socket.id];
			
			// socket.removeListener('spin-command', this._onSpinCcommand);
		});
		
		this.sockets[socket.id] = socket;
		
		// const handshake = {
		// 	stuff: 123
		// };
		// console.log('send handshake');
		// this.io.emit('handshake', handshake);
	};
	
	onDisconnect(socket) {
		this.log('Socket onDisconnect', socket);
	};
	
	disconnect() {
		this.log('disconnecting...');
	}
	
	destroy() {
		this.server.close(); // todo: test
		this.emit('teardown');
	}
	
	static id(serviceConfig) {
		return 'bbserver:'+serviceConfig.port;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		let websocketInstance;
		
		if (serviceId in websocketInstances) {
			websocketInstance = websocketInstances[serviceId];
		}
		else {
			console.log('CREATE WEBSOCKET SERVER', serviceConfig);
			websocketInstance = new BumblebeeWebsocketServer(serviceConfig, serviceStore);
		}
		callback(null, websocketInstance);
	}
}

module.exports = BumblebeeWebsocketServer;
