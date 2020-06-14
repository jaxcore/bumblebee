const ipcRenderer = window.ipcRenderer;

const colors = {
	cancel: 'orange',
	click: 'green',
	down: '#77f',
	error: 'red',
	hail: 'green',
	off: '#f7f',
	okay: '#7f7',
	on: '#7ff',
	up: '#f77'
};

const themes = {
	startrek1: {
		cancel: new Audio('sounds/startrek1/cancel.wav'),
		click: new Audio('sounds/startrek1/click.wav'),
		down: new Audio('sounds/startrek1/down.wav'),
		error: new Audio('sounds/startrek1/error.wav'),
		hail: new Audio('sounds/startrek1/hail.wav'),
		off: new Audio('sounds/startrek1/off.wav'),
		okay: new Audio('sounds/startrek1/okay.wav'),
		on: new Audio('sounds/startrek1/on.wav'),
		up: new Audio('sounds/startrek1/up.wav')
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
					if (bumblebee.analyser) bumblebee.analyser.setLineColor(app.state.microphoneLineColor);
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