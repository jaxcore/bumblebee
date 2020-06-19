import React from "react";
import Choose from "./Choose";
import AppsIcon from '@material-ui/icons/Apps';
import MicIcon from '@material-ui/icons/Mic';

const hotwordNames = {
	'bumblebee': 'Bumblebee',
	'grasshopper': 'Grasshopper',
	'porcupine': 'Porcupine',
	'terminator': 'Terminator',
	'hey_edison': 'Edison'
};

export default function ConsoleOutput(props) {
	return (<div id="recognition-output" className="recognition-output">
		{props.recognitionOutput.map((data, index) => {
			
			let icon;
			let clss;
			
			let logoImage;
			
			let assistant;
			// if (data.type === 'text') {
			// 	if (data.assistant) assistant = data.assistant;
			// }
			
			if (data.type === 'tts' && data.options && data.options.assistant) {
				assistant = data.options.assistant;
			}
			else if (data.assistant) {
				assistant = data.assistant;
			}
			
			// logoImage = (<img src={props.bumblebee.app.state.logo}/>);
			
			if (assistant) { //} === 'bumblebee' || assistant === 'hey_edison') {
				logoImage = (<img src={props.bumblebee.app.themes[assistant].images.hotword}/>);
			}
			else logoImage = (<img src={props.bumblebee.app.themes.mainmenu.images.default}/>);
			
				//logoImage = (<AppsIcon />);

			// if (props.bumblebee.app.state.logo) logoImage = (<img src={props.bumblebee.app.state.logo}/>);
			// if (props.bumblebee.app.state.activeAssistant === 'bumblebee') {
			// 	logoImage = (<img src={props.bumblebee.app.images.bumblebee.default}/>);
			// }
			// else logoImage = (<AppsIcon />);
			
			if (data.type === 'component') {
				if (data.component.choose) {
					return (<Choose key={index} bumblebee={props.bumblebee} choose={data.component.choose}/>);
				}
				// return 'CHOOSE'
			}


			let text;
			// if (data.type === 'command') {
			// 	text = 'COMMAND: ' + text;
			// }

			if (typeof data === 'string' || data.type === 'text') {
				text = data.text;
				clss = 'text';
			}
			else if (data.type === 'text') {
				text = data.text;
				// if (data.assistant)
				icon = logoImage;
				clss = 'text';
			}
			else if (data.type === 'tts') {
				text = data.text;
				icon = logoImage;
			}
			else if (data.type === 'stt') {
				text = data.text;
				icon = (<MicIcon />);
			}
			else if (data.type === 'command') {
				// text = 'COMMAND: ' + data.text;
				icon = (<MicIcon />);
				return (<div key={index} style={{color: props.bumblebee.app.themes[data.hotword].colors.sttColor}}>
					{icon}
					{data.text}
				</div>);
			}
			else if (data.type === 'hotword') {
				// debugger;
				// text = 'HOTWORD: ' + data.hotword;
				return (<div key={index} style={{color: props.bumblebee.app.themes[data.hotword].colors.sttColor}}>
					<img src={props.bumblebee.app.themes[data.hotword].images.hotword}/>
					{hotwordNames[data.hotword]}
				</div>);
			}
				// else if (data.type === 'text') {
				// 	text = data.component;
				// 	// text = 'blah'; //data.console;
			// }
			else {
				text = 'unknown '+JSON.stringify(data)
			}
			
			if (!text) text = '[undefined]';
			
			return (<div key={index} className={clss}>
				{icon}
				{text}
			</div>);
		})}
	</div>)
}