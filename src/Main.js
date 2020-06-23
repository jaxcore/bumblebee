import assistants from './assistants/assistants';

export default async function main(bumblebee) {
	bumblebee.displayApp('main', 'Main Menu');
	
	for (let a of assistants) {
		bumblebee.addAssistant(a.hotword, a.name, a.assistant);
	}
	
	await bumblebee.say("Main");
	// await bumblebee.say("To start a voice assistant, say it's name", {
	// 	consoleOutput: false
	// });
	
	// const hotwordHandler = function(hotwordDetected) {
	// 	// if (hotwordDetected === 'bumblebee') {
	// 	// 	hotword(bumblebee).then(r => {
	// 	// 		debugger;
	// 	// 	})
	// 	// }
	// };
	// const hotwordCommandHandler = function(text, stats) {
	// 	if (stats.hotword === 'bumblebee') {
	// 		hotwordCommand(bumblebee, text, stats).then(r => {
	// 			debugger;
	// 		})
	// 	}
	// };
	
	// bumblebee.addListener('hotword', hotwordHandler);
	// bumblebee.addListener('hotwordCommand', hotwordCommandHandler);
	
	let r = await loop(bumblebee);
	
	debugger;
	// bumblebee.removeListener('hotword', hotwordHandler);
	// bumblebee.removeListener('hotwordCommand', hotwordCommandHandler);
	//
	// bumblebee.removeAssistant('bumblebee');
	// bumblebee.removeAssistant('terminator');
	
	return r;
}

async function hotwordCommand(bumblebee, text, stats) {
	debugger;
	await bumblebee.say('Bumblebee Command: '+text);
	debugger;
}

async function hotword(bumblebee) {
	debugger;
	bumblebee.console('MAIN HOTWORD detected ');
	bumblebee.console('launch assistant Bumblebee');
	await bumblebee.say('starting Bumblebee');
	debugger;
}

const hotwordTimes = {

};

async function loop(bumblebee) {
	await bumblebee.console("Main.loop()");
	
	bumblebee.console("To start a voice assistant, just say it's name");
	//
	// let profileChoice = await bumblebee.choose(null, profiles, {
	// 	style: 'confirm',
	// 	timeout: 25000,
	// 	retryTimeout: true,
	// 	retryUnrecognized: true,
	// 	maximumRetries: 1,
	// 	// unrecognizedText: "Sorry, I didn't understand",
	// 	narrateChoices: false,
	// 	numberize: true
	// });
	
	bumblebee.console("Bumblebee");
	bumblebee.console("Terminator");
	bumblebee.console("Hey Edison");
	
	let r = await bumblebee.recognizeAny();
	if (r.hotword) {
		debugger;
		let app = bumblebee.assistants[r.hotword.hotword];
		if (app && app.assistant) {
			
			await bumblebee.launchAssistant(r.hotword.hotword);
		}
		else {
			debugger;
		}
	}
	else if (r.hotwordCommand) {
		debugger;
	}
	else if (r.recognize) {
		debugger;
	}
	bumblebee.console("Main: "+JSON.stringify(r));
	
	//
	// // let r = await bumblebee.hotword();
	//
	// if (r.stats.hotword) {
	// 	debugger;
	// }
	//
	// if (r.text === 'exit') {
	// 	await bumblebee.say("main exiting");
	// 	return true;
	// }
	// else if (r.text === 'main menu') {
	// 	await bumblebee.launch('Main Menu');
	// 	await bumblebee.say("Main Menu exited");
	// }
	// else if (r.text === 'microphone off' || r.text === 'microphone of' || r.text === 'mike off' || r.text === 'mike of') {
	// 	bumblebee.stopRecording();
	// }
	// else if (r.text === 'go to sleep') {
	// 	await bumblebee.say("I'm going to sleep");
	//
	// 	// let hotword = bumblebee.app.state.hotword;
	// 	// if (hotword === 'ANY') hotword = 'bumblebee';
	// 	// if (hotword === 'OFF') {
	// 	// 	bumblebee.setHotword('bumblebee');
	// 	// 	hotword = 'bumblebee';
	// 	// }
	//
	// 	bumblebee.setMuted(true);
	// 	await bumblebee.say("To wake me up, just say "+hotword);
	// }
	// else if (r.text === 'help') {
	// 	await bumblebee.launch('Help');
	// 	await bumblebee.say("main help done");
	// }
	
	return loop(bumblebee);
}