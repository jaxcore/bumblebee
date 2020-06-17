const ipcRenderer = window.ipcRenderer;

const colors = {
	accept: '#44f',
	alarm: 'purple',
	cancel: 'orange',
	click: 'green',
	deny: 'red',
	down: '#77f',
	error: 'red',
	hail: 'green',
	off: '#f7f',
	on: '#7ff',
	up: '#f77',
	warn: 'yellow'
};

const themes = {
	startrek1: {
		accept: new Audio('sounds/startrek1/accept.wav'),
		alarm: new Audio('sounds/startrek1/alarm.wav'),
		cancel: new Audio('sounds/startrek1/cancel.wav'),
		click: new Audio('sounds/startrek1/click.wav'),
		deny: new Audio('sounds/startrek1/deny.wav'),
		down: new Audio('sounds/startrek1/down.wav'),
		error: new Audio('sounds/startrek1/error.wav'),
		hail: new Audio('sounds/startrek1/hail.wav'),
		off: new Audio('sounds/startrek1/off.wav'),
		on: new Audio('sounds/startrek1/on.wav'),
		up: new Audio('sounds/startrek1/up.wav'),
		warn: new Audio('sounds/startrek1/warn.wav')
	}
};

function connectPlaySound(bumblebee, app) {
	window.playSound = (name, theme) => {
		let id = Math.random().toString().substring(2);
		bumblebee.playSound(name, theme).then(r => {

			ipcRenderer.send('playsound-end-' + id, name, theme);
		}).catch(e => {
			debugger;
		})
	};
	
	async function playSound(name, theme) {
		if (!theme) theme = app.state.soundTheme;
		
		return new Promise(function(resolve, reject) {
			app.setState({
				soundPlaying : true
			});
			
			if (themes[theme] && themes[theme][name]) {
				if (bumblebee.analyser) {
					const color = colors[name];
					bumblebee.analyser.setLineColor(color);
				}
				themes[theme][name].onended = function() {
					app.setState({
						soundPlaying : false
					});
					app.updateBanner();
					if (bumblebee.analyser) {
						// bumblebee.analyser.setLineColor(app.state.microphoneLineColor);
					}
					resolve(true);
				};
				themes[theme][name].play();
			}
			else {
				reject('no file name='+name+' theme='+theme);
			}
		});
	}
	
	return playSound;
}

export {connectPlaySound};