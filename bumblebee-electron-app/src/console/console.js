export default function(data) {
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
		else if (data.type === 'error') {
			let t = 'Error: '+data.text;
			if (data.assistant) t =  data.assistant + ' ' + t;
			this.addSpeechOutput({
				text: t,
				assistant: data.assistant,
				type: 'text'
			});
		}
		else if (data.type === 'tts' && data.text && data.options) {
			if (data.options.consoleOutput === false) {
				return;
			}
			this.addSpeechOutput({
				text: data.text,
				options: data.options,
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
			if (data.type === 'command' || data.stats.hotword) {
				this.addSpeechOutput({
					text: data.text,
					// options: data.stats,
					hotword: data.hotword || data.stats.hotword,
					type: 'command'
				});
			}
			else {
				this.addSpeechOutput({
					text: data.text,
					stats: data.stats,
					type: 'stt'
				});
			}
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