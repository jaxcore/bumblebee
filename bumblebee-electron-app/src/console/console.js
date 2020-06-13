export default function(data) {
	if (typeof data === 'string' || typeof data === 'boolean' || typeof data === 'number') {
		this.addSpeechOutput(data.toString());
	}
	else if (typeof data === 'object') {
		if (data.type === 'tts' && data.text && data.options) {
			this.addSpeechOutput({
				text: data.text,
				options: data.options,
				type: 'tts'
			});
		}
		else if (data.text && data.stats) {
			if (data.stats.hotword) {
				this.addSpeechOutput({
					text: data.text,
					options: data.stats,
					type: 'hotcommand'
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