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
	},
	connectedSpins: {
		type: 'object'
	}
};

const websocketInstances = {};

class BumblebeeWebsocketService extends Client {
	constructor(defaults, store) {
		super(schema, store, defaults);
		this.log = createLogger('Websocket Service');
		this.log('created');
		this._onConnect = this.onConnect.bind(this);
		this._onDisconnect = this.onDisconnect.bind(this);
		this._onSpinCcommand = this.onSpinCcommand.bind(this);
	}
	
	connect() {
		this.app = http.createServer(function (req, res) {
			// fs.readFile(__dirname + '/index.html',
			// 	function (err, data) {
			// 		if (err) {
			// 			res.writeHead(500);
			// 			return res.end('Error loading index.html');
			// 		}
			//
			// 		res.writeHead(200);
			// 		res.end(data);
			// 	});
			// }
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
	
	onConnect(socket) {
		this.log('Socket connected', socket.id, socket.handshake.headers.host, socket.handshake.headers['user-agent']);
		
		this.log('socket', socket.conn.remoteAddress);
		// '::ffff:192.168.1.29',
		if (this.state.allowClients && this.state.allowClients.length) {
			if (this.state.allowClients.indexOf(socket.conn.remoteAddress) === -1) { //} !== '::ffff:127.0.0.1') {
				this.log('invalid remote address', socket.conn.remoteAddress, 'allowed clients are:', this.state.allowClients);
				// this.log('socket', socket);
				// socket.disconnect();
				process.exit();
				return;
			}
		}
		
		socket.once('disconnect', () => {
			this.log('socket disconnected');
			socket.removeListener('spin-command', this._onSpinCcommand);
		});
	};
	
	onDisconnect(socket) {
		this.log('Socket disconnected', socket);
	};
	
	speechRecognize(text, stats) {
		this.log('websocket-service emit speech-recognize', text);
		this.io.emit('speech-recognize', text, stats);
	}
	
	disconnect() {
		this.log('disconnecting...');
	}
	
	destroy() {
		this.server.close(); // todo: test
		this.emit('teardown');
	}
	
	static id(serviceConfig) {
		return 'websocket:'+serviceConfig.port;
	}
	
	static getOrCreateInstance(serviceStore, serviceId, serviceConfig, callback) {
		let websocketInstance;
		
		if (serviceId in websocketInstances) {
			websocketInstance = websocketInstances[serviceId];
		}
		else {
			console.log('CREATE WEBSOCKET', serviceConfig);
			websocketInstance = new WebsocketService(serviceConfig, serviceStore);
		}
		callback(null, websocketInstance);
	}
}

module.exports = BumblebeeWebsocketService;
