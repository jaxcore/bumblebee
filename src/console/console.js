export default function(data) {
	console.log('render console');
	
	if (typeof data === 'string' || typeof data === 'boolean' || typeof data === 'number') {
		this.addSpeechOutput({
			text: data.toString(),
			type: 'text'
		});
	}
	else if (typeof data === 'object') {
		if (data.type === 'text' && data.text) {
			this.addSpeechOutput(data);
		}
		else if (data.type === 'text') {
			this.addSpeechOutput({
				text: data.text,
				assistant: data.assistant,
				type: 'text'
			});
		}
		else if (data.type === 'error') {
			let t = 'Error: '+data.text;
			// if (data.assistant) t =  data.assistant + ' ' + t;
			this.addSpeechOutput({
				text: t,
				assistant: data.assistant,
				type: 'text'
			});
		}
		else if (data.type === 'stt' && data.text) {
			this.addSpeechOutput({
				text: data.text,
				stats: data.stats,
				assistant: data.assistant,
				type: 'stt'
			});
		}
		else if (data.type === 'command') {
			this.addSpeechOutput({
				text: data.text,
				// options: data.stats,
				hotword: data.hotword || data.stats.hotword,
				type: 'command'
			});
		}
		else if (data.type === 'tts' && data.text) {
			if (data.options.consoleOutput === false) {
				return;
			}
			this.addSpeechOutput({
				text: data.text,
				options: data.options,
				assistant: data.assistant,
				type: 'tts'
			});
		}
		else if (data.type === 'hotword') {
			this.addSpeechOutput({
				hotword: data.hotword,
				type: 'hotword'
			});
		}
		else if (data.text && data.stats) {
			// recognition
			
			// else {
				this.addSpeechOutput({
					text: data.text,
					stats: data.stats,
					assistant: data.assistant,
					type: 'stt'
				});
			// }
		}
		
		else if (data.type === 'component') {
			this.addSpeechOutput({
				component: data.component,
				type: 'component'
			});
		}
		else {
			debugger;
		}
	}
}