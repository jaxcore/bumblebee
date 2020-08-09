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
};

module.exports = function connectWSServer(bumblebee, app, deepspeech, bbWebsocketServer) {
	let doBumblebeeIntro = false;
	
	ipcMain.on('hotword-data', function (event, intData, floatData, sampleRate, hotword) {
		if (hotword) {
			let assistantLoaded = hotwordDetected(hotword);
			if (!assistantLoaded) hotword = null;
		}
		var uint8View = new Uint8Array(intData.buffer);
		let buffer = Buffer.from(uint8View);
		deepspeech.streamData(buffer, sampleRate, hotword, floatData);
	});
	
	deepspeech.on('hotword', function (hotword, text, stats) {
		let activeAssistantSocket = getActiveAssistantSocket();
		if (activeAssistantSocket) {
			console.log('DS ('+app.state.activeAssistant+') HOTWORD COMMAND', text, stats);
			
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
		}
	});
	
	deepspeech.on('recognize', function (text, stats) {
		console.log('DS recognize', text, stats);
		let activeAssistantSocket = getActiveAssistantSocket();
		if (activeAssistantSocket) {
			// app.execFunction('systemError', ['activeAssistantSocket recognize '+text]);
			// console.log('DS Assistant recognize ('+app.state.activeAssistant+')', text, stats);
			// const recogId = Math.random().toString().substring(2);
			let hotword = app.state.activeAssistant;
			if (app.state.activeApplications[hotword].appId === 'main') {
				// console.log('activeAssistantSocket emit','recognize', text, stats, 'hotword='+hotword);
				activeAssistantSocket.emit('recognize', text, stats);
			}
			else {
				let appId = app.state.activeApplications[hotword].appId;
				let appSocket = getApplicationSocket(hotword, appId);
				if (appSocket) {
					console.log('active app emit', 'recognize', text, appId);
					appSocket.emit('recognize', text, stats);
				}
				else {
					console.log('on recognize: app socket does not exist', hotword, appId);
					// setActiveApplication(hotword, 'main');
				}
			}
		}
		else {
			let functionName = 'deepspeechResults';
			let args = [text, stats];
			app.execFunction(functionName, args);
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
	
	function getApplicationSocket(hotword, appId) {
		const assistant = app.state.assistants[hotword];
		if (assistant && app.state.applications[hotword][appId]) {
			const socketId = app.state.applications[hotword][appId].applicationSocketId;
			return bumblebee.bbWebsocketServer.sockets[socketId];
		}
	}
	
	function setActiveApplication(assistant, appId, runId) {
		console.log('setActiveApplication assistant=', assistant, 'appId=', appId, runId);
		const activeApplications = {
			...app.state.activeApplications
		};
		activeApplications[assistant] = {
			appId,
			runId
		};
		app.setState({activeApplications});
		app.updateClientConfig();
	}
	
	function hotwordDetected(hotword) {
		if (hotword && hotword in app.state.assistants) {
			setActiveAssistant(hotword);
			bumblebee.console({
				type: 'hotword',
				hotword
			})
			if (hotword === app.state.activeAssistant) {
				let activeAssistantSocket = getActiveAssistantSocket();
				if (activeAssistantSocket) {
					console.log('DS Assistant (' + app.state.activeAssistant + ') hotword detected', hotword);
					activeAssistantSocket.emit('hotword', hotword);
				}
			}
			return true;
		}
		else {
			bumblebee.console(hotword+' assistant not found');
			return false;
		}
	}
	
	function setActiveAssistant(hotword) {
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
						activeAssistant: hotword
						// activeAssistantsApp: appName
						// activeAssistantsMainMenu: true
					});
					
					const assistantName = app.state.assistants[hotword].name;
					
					app.execFunction('hotwordAssistant', [hotword, assistantName]);
					// debugger;
					
					let id = getId();
					
					console.log('emit assistant-active', true, id);
					
					socket.once('assistant-active-'+id, function() {
						console.log('confirmed assistant-active', id);
						socket.emit('assistant-active-confirm-'+id);
						
						app.emit('assistant-active-'+hotword);
					})
					socket.emit('assistant-active', true, id);
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
				
				app.setState({
					activeAssistant: null
					// activeAssistantsApp: null
				});
				app.execFunction('hotwordAssistant', [null, null, null]);
			}
		}
	}
	
	function unregisterAssistant(socket) {
		if (socket.id in app.state.socketAssistants) {
			let assistants = app.state.assistants;
			let socketAssistants = app.state.socketAssistants;
			let hotwordsAvailable = app.state.hotwordsAvailable;
			
			const hotword = socketAssistants[socket.id];
			
			closeAssistantApps(hotword);
			
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
					activeAssistant: null
					// activeAssistantsApp: null
				});
				debugger;
			}
			console.log('unregisterAssistant', app.state);
			// debugger;
			bumblebee.console('disconnected '+hotword);
		}
	}
	
	function closeAssistantApps(hotword) {
		console.log('closeAssistantApps', hotword);
		for (let appId in app.state.applications[hotword]) {
			removeApp(hotword, appId);
		}
	}
	
	
	function unregisterApplication(hotword, appId) {
		let assistantSocket = getAssistantSocket(hotword);
		if (assistantSocket) {
			assistantSocket.emit('remove-application', appId);
		}
	}
	
	function removeApp(hotword, appId) {
		console.log('removeApp', hotword, appId);
		
		try {
			let appSocket = getApplicationSocket(hotword, appId);
			if (appSocket) {
				console.log('disconnectin appSocket');
				appSocket.disconnect();
			}
			else {
				console.log('appSocket NOT FOUND');
				if (app.state.activeApplications[hotword].appId === appId) {
					console.log('removeApp this is the active app, disconnected?');
					setActiveApplication(hotword, 'main'); //'main');
				}
			}
			
			const applications = {...app.state.applications};
			delete applications[hotword][appId];
			
			app.setState({
				applications
			});
		}
		catch(e) {
			console.log('remove crash', e);
			process.exit();
		}
	}
	
	function assistantRequestAddApplication(assistantSocket, applicationSocket, applicationOptions, appInfo) {
		// debugger;
		assistantSocket.once('application-added-'+applicationOptions.id, function(response) {
			if (response === true) {
				// applicationOptions.autoStart
				const applications = {
					...app.state.applications
				}
				if (!applications[applicationOptions.assistant]) {
					applications[applicationOptions.assistant] = {};
				}
				if (applications[applicationOptions.assistant][applicationOptions.id]) {
					applicationSocket.emit('register-application-response', {
						success: false,
						error: 'application id already registered: '+applicationOptions.id
					});
					return;
				}
				
				applicationSocket.once('disconnect', function() {
					console.log('applicationSocket disconnect');
					
					let isActive = false;
					if (app.state.activeApplications[applicationOptions.assistant] && app.state.activeApplications[applicationOptions.assistant].appId === applicationOptions.id) {
						console.log('disconnect application is the active app', applicationOptions.id);
						
						// let appId = app.state.activeApplications[applicationOptions.assistant].appId;
						let runId = app.state.activeApplications[applicationOptions.assistant].runId;
						
						const assistantSoocket = getAssistantSocket(applicationOptions.assistant);
						console.log('EMIT run-application-abort-' + runId);
						assistantSoocket.emit('run-application-abort-' + runId, 'app disconnected');
						
						// process.exit();
						isActive = true;
					}
					
					// send messaage to assistant
					unregisterApplication(applicationOptions.assistant, applicationOptions.id);
					// setActiveApplication(hotword, 'main');
					
					removeApp(applicationOptions.assistant, applicationOptions.id);
					
					if (isActive) {
						// return to main
						// setActiveApplication(applicationOptions.assistant, 'main');
					}
				});
				
				applications[applicationOptions.assistant][applicationOptions.id] = {
					...applicationOptions,
					applicationSocketId: applicationSocket.id,
					assistantSocketId: assistantSocket.id
				};
				
				const socketApplications = {...app.state.socketApplications};
				socketApplications[applicationSocket.id] = {
					appId: applicationOptions.id,
					assistant: applicationOptions.assistant
				};
				
				app.setState({
					applications,
					socketApplications
				});
				
				applicationSocket.emit('register-application-response', {
					success: true
				});
				
				if (applicationOptions.autoStart === true) {
					console.log('autoStart emit application-autostart ----------------');
					assistantSocket.emit('application-autostart', applicationOptions.id);
				}
			}
		});
		assistantSocket.emit('request-add-application', applicationOptions, appInfo);
	}
	
	function registerApplication(socket, applicationOptions) {
		app.log('register-application', applicationOptions);
		bumblebee.console('application '+JSON.stringify(applicationOptions));
		if (!applicationOptions.assistant) applicationOptions.assistant = 'bumblebee';
		if (!applicationOptions.id) applicationOptions.id = applicationOptions.name;
		if (!applicationOptions.name) {
			socket.emit('register-application-response', {
				success: false,
				error: 'no name'
			});
			return;
		}
		
		const assistantSocket = getAssistantSocket(applicationOptions.assistant);
		if (!assistantSocket) {
			socket.emit('register-application-response', {
				success: false,
				error: 'assistant not active: '+applicationOptions.assistant
			});
			return;
		}
		
		if (app.state.activeAssistant !== applicationOptions.assistant) {
			// if the assistant is not active, activate it, then wait until after the assistant onBegin() has completed
			assistantSocket.once('application-begun', function() {
				// after "Bumblebee Ready"
				assistantRequestAddApplication(assistantSocket, socket, applicationOptions, {
					socketId: socket.id,
					removeAddress: socket.conn.remoteAddress
				});
			});
			hotwordDetected(applicationOptions.assistant);
		}
		else {
			assistantRequestAddApplication(assistantSocket, socket, applicationOptions, {
				socketId: socket.id,
				removeAddress: socket.conn.remoteAddress
			});
		}
	}
	
	function registerAssistant(socket, assistantOptions) {
		app.log('register-assistant', assistantOptions);
		const hotword = assistantOptions.hotword;
		if (app.state.hotwordsAvailable.indexOf(hotword) > -1) {
			
			let assistants = {...app.state.assistants};
			let socketAssistants = {...app.state.socketAssistants};
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
			
			if (doBumblebeeIntro) {
				socket.emit('system-message', {
					startBumblebeeIntro: true
				});
				doBumblebeeIntro = false;
			}
			
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
	
	// todo: there is a bug where in some cases the assistant can connect multiple times and create duplicate instances
	
	function onSocketConnect(socket) {
		socket.on('register-assistant', (assistantOptions) => {
			registerAssistant(socket, assistantOptions);
		});
		
		socket.on('register-application', (applicatioonOptions) => {
			registerApplication(socket, applicatioonOptions);
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
		
		socket.on('active-app', (appId, runId) => {
			let activeAssistantSocket = getActiveAssistantSocket();
			if (socket === activeAssistantSocket) {
				const hotword = app.state.socketAssistants[socket.id];
				setActiveApplication(hotword, appId, runId);
			}
		});
		
		socket.on('console', (data) => {
			this.log('console', data);
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
			const hotword = app.state.socketAssistants[socket.id];
			if (!options) options = {};
			options.assistant = hotword;
			
			console.log('socket say', text, options);
			
			bumblebee.say(text, options).then(() => {
				console.log('emit say-end-'+id);
				socket.emit('say-end-'+id);
			});
		});
		
		socket.on('assistant-return-error', (message) => {
			console.log('assistant-return-error', message);
			const hotword = app.state.socketAssistants[socket.id];
			
			bumblebee.console({
				type: 'error',
				text: message,
				assistant: hotword
			});
			
			if (hotword) {
				console.log('assistant error message=', message);
				const assistantName = app.state.assistants[hotword].name;
				
				if (message && typeof message === 'object') {
					bumblebee.say(assistantName + ' something something');
				}
				
				if (typeof message === 'string') {
					bumblebee.console({
						type: 'error',
						text: message,
						assistant: hotword
					});
					bumblebee.say(assistantName + ' encountered an error');
				}
				
				if (hotword === getActiveAssistant()) {
					console.log('this socket is the active assistant')
					if (message === 'app disconnected') {
						console.log('ignore error ', message);
					}
					else {
						setActiveAssistant();
					}
				}
				else {
					console.log('this socket is NOT the active assistant');
					debugger;
				}
			}
		});
		
		socket.on('assistant-return-value', (value) => {
			const hotword = app.state.socketAssistants[socket.id];
			if (hotword) {
				if (hotword === getActiveAssistant()) {
					console.log('this socket is the active assistant')
					setActiveAssistant();
				}
				else {
					console.log('this socket is NOT the active assistant');
					// debugger;
				}
				bumblebee.console('assistant '+hotword+' returned '+JSON.stringify(value));
				bumblebee.say('the '+hotword+' assistant has exited');
			}
		});
		
		// message from assistant OR applications
		socket.on('run-application', (runId, appId, args, options) => {
			console.log('run-application -----------------');
			console.log('run-application', runId, appId, args, options);
			
			let assistant;
			if (socket.id in app.state.socketAssistants) {
				// is assistant
				assistant = app.state.socketAssistants[socket.id];
			}
			if (socket.id in app.state.socketApplications) {
				// is application
				assistant = app.state.socketApplications[socket.id].assistant;
			}
			
			if (assistant) {
				if (!app.state.applications[assistant]) {
					console.log('ERROR ------- app.state.applications[assistant]', assistant, runId, appId);
					debugger;
				}
				
				if (appId in app.state.applications[assistant]) {
					const appOptions = app.state.applications[assistant][appId];
					const appSocket = bumblebee.bbWebsocketServer.sockets[appOptions.applicationSocketId];
					if (appSocket) {
						let _currentAppId = app.state.activeApplications[assistant].appId;
						let _currentRunId = app.state.activeApplications[assistant].runId;
						setActiveApplication(assistant, appId, runId);
						appSocket.once('run-application-response-'+assistant+'-'+runId, (errValue, returnValue) => {
							console.log('app has exited, return to', _currentAppId);
							setActiveApplication(assistant, _currentAppId, _currentRunId);
							socket.emit('run-application-response-'+runId, errValue, returnValue);
						});
						appSocket.emit('run-application-request', assistant, runId, args, options);
					}
					else {
						console.log('appSocket not found');
					}
				}
			}
		});
		
		socket.on('play-sound', (id, name, theme) => {
			const onBegin = function() {
				socket.emit('play-sound-begin-'+id);
			};
			bumblebee.saySound(name, theme, onBegin).then(() => {
				socket.emit('play-sound-end-'+id);
			});
		});
		
		socket.on('', (id) => {
		
		});
		
		socket.on('system-request', (id, dataId, args) => {
			if (dataId === 'say-default-profile') {
				let profile = args[0];
				app.execFunction('setDefaultSayProfile', [profile]);
				socket.emit('system-response-'+id, {
					response: true
				});
			}
			if (dataId === 'select-microphone') {
				ipcMain.on('microphone-selected', (event, deviceid) => {
					const response = {
						response: deviceid
					};
					socket.emit('system-response-'+id, response);
				});
				let deviceId = args[0];
				app.execFunction('selectMicrophone', [deviceId]);
			}
			if (dataId === 'microphone-list') {
				ipcMain.on('get-microphones', (event, mics) => {
					const response = {
						response: mics
					}
					socket.emit('system-response-'+id, response)
				});
				app.execFunction('getMicrophones');
			}
		});
	}
	
	function onSocketDisconnect(socket) {
		console.log('onSocketDisconnect', socket.id);
		if (socket.id in app.state.socketApplications) {
			const socketApplications = {...app.state.socketApplications};
			delete socketApplications[socket.id];
			app.setState({
				socketApplications
			});
		}
		unregisterAssistant(socket);
	}
	
	bbWebsocketServer.onSocketConnect = onSocketConnect;
	bbWebsocketServer.onSocketDisconnect = onSocketDisconnect;
	
	ipcMain.on('start-bumblebee-intro', function(event) {
		doBumblebeeIntro = true;
	});
	
	return bbWebsocketServer;
}