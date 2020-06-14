export default async function DeepSpeechInstalled(bumblebee) {
	bumblebee.stopRecording();
	
	await bumblebee.say('Congratulations');
	await bumblebee.say('DeepSpeech has been installed');
	await bumblebee.say('To begin, turn on the microphone');
	await bumblebee.onRecordingStarted();
	
	// if (this.state.config.recording) {
	// 	this.startRecording();
	// }
	// else {
	// }
	// this.startRecording();
	
	// let text = await bumblebee.recognize();
	
	await bumblebee.say('Now say something');
	
	let r = await bumblebee.recognize();
	
	// try {
	// 	text = await bumblebee.recognize();
	// }
	// catch(e) {
	// 	throw new Error('timed out');
	// }
	//
	
	await bumblebee.say('You said, ' + r.text);
	await bumblebee.say('Alright, you are all set.');
	
	return bumblebee.launch('Customize');
	
}