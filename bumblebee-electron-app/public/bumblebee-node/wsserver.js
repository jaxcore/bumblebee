const ipcMain = require('electron').ipcMain;

module.exports = function connectWSServer(bumblebee, app, deepspeech, bumblebeeHotword, callback) {
	
	// const deepspeech = app.deepspeech;
	// const bumblebeeHowtord = app.bumblebeeHotword;
	// const say = app.say;
	
	function setActiveAssistant(hotword) {
		app.setState({
			activeAssistant: hotword
		});
		app.execFunction('active-assistant', hotword);
	}
	
	function unregisterAssistant(socket) {
		if (socket.id in app.state.socketAssistants) {
			let assistants = app.state.assistants;
			let socketAssistants = app.state.socketAssistants;
			let hotwordsAvailable = app.state.hotwordsAvailable;
			
			const hotword = socketAssistants[socket.id];
			delete assistants[hotword];
			delete socketAssistants[socket.id];
			hotwordsAvailable.push(hotword);
			
			app.setState({
				assistants,
				socketAssistants,
				hotwordsAvailable
			});
			
			console.log('unregisterAssistant', app.state);
			debugger;
		}
	}
	
	function registerAssistant(socket, hotword) {
		app.log('register-assistant', hotword);
		if (app.state.hotwordsAvailable.indexOf(hotword) > -1) {
			
			let assistants = app.state.assistants;
			let socketAssistants = app.state.socketAssistants;
			let hotwordsAvailable = app.state.hotwordsAvailable;
			
			assistants[hotword] = socket.id;
			socketAssistants[socket.id] = hotword;
			
			hotwordsAvailable.splice(hotwordsAvailable.indexOf(hotword), 1);
			app.setState({
				assistants,
				socketAssistants,
				hotwordsAvailable
			});
			
			const r = {};
			r[hotword] = {
				success: true
			};
			debugger;
			
			socket.emit('register-assistant-response', r);
			// socket.bbAssistant = hotword;
		}
		else {
			socket.emit('register-assistant-response', {
				success: false,
				hotwordsAvailable: app.state.hotwordsAvailable
			});
		}
	}
	
	function onSocketConnect(socket) {
		socket.on('register-assistant', (hotword) => {
			registerAssistant(socket, hotword);
		});
		
		socket.on('jaxcore-handshake', (handshake) => {
			debugger;
			app.log('jaxcore-handshake', handshake);
			socket.emit('jaxcore-handshake-response', {
				success: true,
				bumblebee: {
					hotwordsAvailable: this.state.hotwordsAvailable
				}
			});
			// socket.removeListener('spin-command', this._onSpinCcommand);
		});
		
	}
	
	function onSocketDisconnect(socket) {
		console.log('onSocketDisconnect', socket.id);
		debugger;
		unregisterAssistant(socket);
	}
	
	ipcMain.once('bumblebee-start-server', (event, hotword, command) => {
		console.log('bumblebee-start-service', hotword, command);
		app.jaxcore.startServiceProfile('Bumblebee Assistant Server', (err, bbWebsocketServer) => {
			bbWebsocketServer.init(bumblebee, app, onSocketConnect, onSocketDisconnect);
			callback(bbWebsocketServer);
			// bbWebsocketServer
		})
	});
}