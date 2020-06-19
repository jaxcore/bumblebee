const ipcMain = require('electron').ipcMain;

function getId() {
	return Math.random().toString().substring(2);
}

const hotwordSubstitutions = {
	bumblebee: ['bumble bee', 'bumble', 'mumble', 'tumble', 'bee'],
	grasshopper: ['grass over'],
	hey_edison: ['he addison', 'he had in'],
	terminator: ['grass over'],
	porcupine: []
}

module.exports = function connectWSServer(bumblebee, app, deepspeech, bbHotword, callback) {
	
	// const deepspeech = app.deepspeech;
	// const bumblebeeHowtord = app.bumblebeeHotword;
	// const say = app.say;
	
	bbHotword.on('hotword', function (hotword) {
		console.log('Hotword Detected:', hotword);
		setActiveAssistant(hotword);
		
		// let name = app.hotwordNames[hotword];
		bumblebee.console({
			type: 'hotword',
			hotword
		})
		
		if (hotword === app.state.activeAssistant) {
			let activeAssistantSocket = getActiveAssistantSocket();
			if (activeAssistantSocket) {
				console.log('DS Assistant (' + app.state.activeAssistant + ') hotword detected', hotword);
				// const recogId = Math.random().toString().substring(2);
				console.log('activeAssistantSocket emit hotword', hotword);
				activeAssistantSocket.emit('hotword', hotword);
			}
		}
	});
	
	deepspeech.on('hotword', function (hotword, text, stats) {
		// console.log('DS hotword:'+hotword, 'text='+text, stats);
		// let functionName = 'hotwordResults';
		// let args = [hotword, text, stats];
		// app.execFunction(functionName, args);
		let activeAssistantSocket = getActiveAssistantSocket();
		if (activeAssistantSocket) {
			console.log('DS Assistant ('+app.state.activeAssistant+') command', text, stats);
			// const recogId = Math.random().toString().substring(2);
			
			let subs = hotwordSubstitutions[hotword];
			for (let sub of subs) {
				if (text.startsWith(hotword)) {
					text = text.substring(hotword.length).trim();
					break;
				}
				else if (text.startsWith(sub)) {
					text = text.substring(sub.length).trim();
					break;
				}
				else if (text.endsWith(sub)) {
					text = text.substring(0, text.length - sub.length).trim();
					break;
				}
			}
			if (!text) return;
			activeAssistantSocket.emit('command', text, stats);
		}
		else {
			if (hotword in app.state.assistants) {
				// will be processed by the assistant
			}
			else {
				bumblebee.console('the '+hotword+' assistant is unavailable');
			}
			// let functionName = 'deepspeechResults';
			// let args = [text, stats];
			// app.execFunction(functionName, args);
			// // activeAssistantSocket.on('recognize-response-'+recogId, text, stats, recogId);
			// console.log('DS recognize', text, stats);
		}
	});
	
	deepspeech.on('recognize', function (text, stats) {
		let activeAssistantSocket = getActiveAssistantSocket();
		if (activeAssistantSocket) {
			console.log('DS Assistant recognize ('+app.state.activeAssistant+')', text, stats);
			// const recogId = Math.random().toString().substring(2);
			activeAssistantSocket.emit('recognize', text, stats);
		}
		else {
			let functionName = 'deepspeechResults';
			let args = [text, stats];
			app.execFunction(functionName, args);
			// activeAssistantSocket.on('recognize-response-'+recogId, text, stats, recogId);
			console.log('DS recognize', text, stats);
		}
	});
	
	function getActiveAssistant() {
		return app.state.activeAssistant;
	}
	
	function getActiveAssistantSocket() {
		return getAssistantSocket(app.state.activeAssistant);
	}
	
	function getAssistantSocket(hotword) {
		const assistant = app.state.assistants[hotword];
		if (assistant) {
			const socketId = assistant.socketId;
			return bumblebee.bbWebsocketServer.sockets[socketId];
		}
	}
	
	
	function setActiveAssistantApp(appName) {
		console.log('setActiveAssistantApp', appName);
		app.setState({
			activeAssistantsApp: appName
		});
		app.execFunction('hotwordAssistantApp', [appName]);
	}
	
	function setActiveAssistant(hotword, appName) {
		if (app.state.activeAssistant !== hotword) {
			let activeAssistantSocket = getActiveAssistantSocket();
			if (activeAssistantSocket) {
				// debugger;
				console.log('emit assistant-active', false);
				activeAssistantSocket.emit('assistant-active', false);
			}
			
			if (hotword && hotword in app.state.assistants) {
				const socket = getAssistantSocket(hotword);
				if (socket) {
					// let functionName = 'hotwordDetected';
					// let args = [hotword];
					// app.execFunction(functionName, args, function () {
					// 	console.log('hotwordDetected code complete');
					// });
					app.setState({
						activeAssistant: hotword,
						activeAssistantsApp: appName
						// activeAssistantsMainMenu: true
					});
					
					const assistantName = app.state.assistants[hotword].name;
					
					app.execFunction('hotwordAssistant', [hotword, assistantName, appName]);
					// debugger;
					
					let id = getId();
					
					console.log('emit assistant-active', true, id);
					
					socket.once('assistant-active-'+id, function() {
						console.log('confirmed assistant-active', id);
						socket.emit('assistant-active-confirm-'+id);
					})
					socket.emit('assistant-active', true,id);
				}
				else {
					console.log('the assistant was not found');
				}
			}
			else {
				let activeAssistantSocket = getActiveAssistantSocket();
				if (activeAssistantSocket) {
					debugger;
					activeAssistantSocket.emit('assistant-active', false);
				}
				
				debugger;
				app.setState({
					activeAssistant: null,
					activeAssistantsApp: null
				});
				app.execFunction('hotwordAssistant', [null, null, null]);
			}
		}
		
		// app.execFunction('hotwordAssistant', [hotword]);
		// setActiveAssistantApp(null);
	}
	
	// function setActiveAssistantApp(appName) {
	// 	app.setState({
	// 		activeAssistantApp: appName
	// 	});
	// 	app.execFunction('hotwordAssistant', [this.state.activeAssistant, appName]);
	// }
	
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
			
			let activeAssistantSocket = getActiveAssistantSocket();
			if (activeAssistantSocket === socket) {
				app.setState({
					activeAssistant: null,
					activeAssistantsApp: null
				});
				debugger;
			}
			console.log('unregisterAssistant', app.state);
			// debugger;
			bumblebee.console('disconnected '+hotword);
		}
	}
	
	function registerAssistant(socket, hotword, assistantOptions) {
		app.log('register-assistant', hotword, assistantOptions);
		if (app.state.hotwordsAvailable.indexOf(hotword) > -1) {
			
			let assistants = app.state.assistants;
			let socketAssistants = app.state.socketAssistants;
			let hotwordsAvailable = app.state.hotwordsAvailable;
			
			assistants[hotword] = {
				name: app.assistantNames[hotword],
				socketId: socket.id
			};
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
			
			socket.emit('register-assistant-response', r);
			
			
			if (assistantOptions) {
				if (assistantOptions.autoStart === true) {
					console.log('AUTO STARTING', hotword);
					setActiveAssistant(hotword);
				}
			}
			
			bumblebee.console('connected '+hotword);
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
		socket.on('register-assistant', (hotword, assistantName, assistantOptions) => {
			registerAssistant(socket, hotword, assistantName, assistantOptions);
		});
		
		socket.on('jaxcore-handshake', (handshake) => {
			// debugger;
			app.log('jaxcore-handshake', handshake);
			socket.emit('jaxcore-handshake-response', {
				success: true,
				bumblebee: {
					hotwordsAvailable: app.state.hotwordsAvailable
				}
			});
			// socket.removeListener('spin-command', this._onSpinCcommand);
		});
		
		socket.on('active-app', (appName) => {
			let activeAssistantSocket = getActiveAssistantSocket();
			if (socket === activeAssistantSocket) {
				const hotword = app.state.socketAssistants[socket.id];
				console.log(hotword, 'activeApp = ', appName);
				setActiveAssistantApp(appName);
			}
		});
		
		socket.on('console', (data) => {
			if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
				data = {
					type: 'text',
					text: data.toString()
				}
			}
			const hotword = app.state.socketAssistants[socket.id];
			data.assistant = hotword;
			bumblebee.console(data);
		});
		
		socket.on('say', (text, options, id) => {
			console.log('say', text);
			const hotword = app.state.socketAssistants[socket.id];
			if (!options) options = {};
			options.assistant = hotword;
			bumblebee.say(text, options).then(() => {
				console.log('emit say-end-'+id);
				socket.emit('say-end-'+id);
			});
		});
		
		socket.on('assistant-return-error', (message) => {
			console.log('assistant-return-error', message);
			const hotword = app.state.socketAssistants[socket.id];
			
			if (hotword) {
				console.log('assistant error message=', message);
				const assistantName = app.state.assistants[hotword].name;
				
				if (message && typeof message === 'object') {
					bumblebee.say(assistantName + ' something something');
				}
				
				if (typeof message === 'string') {
					// app.addSpeechOutput({
					// 	text: assistantName+' Error: '+message,
					// 	type: 'text'
					// });
					bumblebee.console({
						type: 'error',
						text: message,
						assistant: hotword
					});
					bumblebee.say(assistantName + ' encountered an error');
				}
				if (hotword === getActiveAssistant()) {
					console.log('this socket is the active assistant')
					setActiveAssistant();
				}
				else {
					console.log('this socket is NOT the active assistant');
					debugger;
				}
			}
		});
		
		socket.on('assistant-return-value', (value) => {
			console.log('assistant-return-value', value);
			
			const hotword = app.state.socketAssistants[socket.id];
			if (hotword) {
				const assistantName = app.state.assistants[hotword].name;
				
				if (hotword === getActiveAssistant()) {
					console.log('this socket is the active assistant')
					setActiveAssistant();
				}
				else {
					console.log('this socket is NOT the active assistant');
					debugger;
				}
				
				bumblebee.console('assistant '+hotword+' returned '+JSON.stringify(value));
				
				bumblebee.say('the '+hotword+' assistant has exited').then(() => {
				
				});
			}
		});
		
		// socket.on('exit-assistant', (value) => {
		// 	let activeAssistantSocket = getActiveAssistantSocket();
		// 	if (activeAssistantSocket === socket) {
		// 		console.log('exit-assistant')
		// 		setActiveAssistant();
		// 	}
		// });
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
			
			// debugger;
			// bumblebee.say('okay, starting server...');
			
			callback(bbWebsocketServer);
			// bbWebsocketServer
		})
	});
}