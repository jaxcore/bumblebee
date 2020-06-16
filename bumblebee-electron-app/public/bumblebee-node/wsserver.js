const ipcMain = require('electron').ipcMain;

module.exports = function connectWSServer(bumblebee, app, deepspeech, bbHotword, callback) {
	
	// const deepspeech = app.deepspeech;
	// const bumblebeeHowtord = app.bumblebeeHotword;
	// const say = app.say;
	
	bbHotword.on('hotword', function (hotword) {
		console.log('Hotword Detected:', hotword);
		setActiveAssistant(hotword);
	});
	
	deepspeech.on('hotword', function (hotword, text, stats) {
		console.log('DS hotword:'+hotword, 'text='+text, stats);
		let functionName = 'hotwordResults';
		let args = [hotword, text, stats];
		app.execFunction(functionName, args);
	});
	
	deepspeech.on('recognize', function (text, stats) {
		
		// let functionName = 'deepspeechResults';
		// let args = [text, stats];
		// app.execFunction(functionName, args);
		
		let activeAssistantSocket = getActiveAssistantSocket();
		if (activeAssistantSocket) {
			console.log('DS Assistant recognize ('+app.state.activeAssistant+')', text, stats);
			const recogId = Math.random().toString().substring(2);
			activeAssistantSocket.emit('recognize', text, stats, recogId);
			// activeAssistantSocket.on('recognize-response-'+recogId, text, stats, recogId);
			
		}
		else {
			console.log('DS recognize', text, stats);
		}
	});
	
	function getActiveAssistantSocket() {
		return getAssistantSocket(app.state.activeAssistant);
	}
	
	function getAssistantSocket(hotword) {
		const socketId = app.state.assistants[hotword];
		return bumblebee.bbWebsocketServer.sockets[socketId];
	}
	
	function setActiveAssistant(hotword) {
		if (hotword) {
			if (app.state.activeAssistant !== hotword) {
				let activeAssistantSocket = getActiveAssistantSocket();
				if (activeAssistantSocket) {
					debugger;
					activeAssistantSocket.emit('assistant-active', false);
				}
				
				if (hotword in app.state.assistants) {
					const socket = getAssistantSocket(hotword);
					if (socket) {
						let functionName = 'hotwordDetected';
						let args = [hotword];
						app.execFunction(functionName, args, function () {
							console.log('hotwordDetected code complete');
						});
						app.setState({
							activeAssistant: hotword
						});
						debugger;
						socket.emit('assistant-active', true);
					}
					
				}
			}
		}
		else {
			debugger;
			app.setState({
				activeAssistant: null
			});
		}
	}
	
	function unregisterAssistant(socket) {
		if (socket.id in app.state.socketAssistants) {
			
			// const hotword = socketAssistants[socket.id];
			// const socketId = app.state.assistants[hotword];
			// if (socketId === socketId.id) {
			// 	debugger;
			// }
			
			let assistants = app.state.assistants;
			let socketAssistants = app.state.socketAssistants;
			let hotwordsAvailable = app.state.hotwordsAvailable;
			
			const hotword = socketAssistants[socket.id];
			delete assistants[hotword];
			delete socketAssistants[socket.id];
			hotwordsAvailable.push(hotword);
			
			setActiveAssistant(null);
			
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
			// debugger;
			
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
			
			bumblebee.bbWebsocketServer = bbWebsocketServer;
			
			callback(bbWebsocketServer);
			// bbWebsocketServer
		})
	});
}