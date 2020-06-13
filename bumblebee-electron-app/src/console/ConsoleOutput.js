import React from "react";
import Choose from "./Choose";

export default function ConsoleOutput(props) {
	return (<div id="recognition-output" className="recognition-output">
		{props.recognitionOutput.map((data, index) => {
			
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
			
			if (typeof data === 'string') {
				text = data;
			}
			else if (data.type === 'tts') {
				text = 'TTS: ' + data.text;
			}
			else if (data.type === 'stt') {
				text = 'STT: ' + data.text;
			}
			else if (data.type === 'hotcommand') {
				// text = 'COMMAND: ' + data.text;
				return (<div key={index} className='command'>{data.text}</div>);
			}
			else if (data.type === 'hotword') {
				// text = 'HOTWORD: ' + data.hotword;
				return (<div key={index} className='hotword'>{data.hotword}</div>);
			}
				// else if (data.type === 'text') {
				// 	text = data.component;
				// 	// text = 'blah'; //data.console;
			// }
			else {
				text = 'unknown '+JSON.stringify(data)
			}
			
			if (!text) text = '[undefined]';
			
			return (<div key={index}>{text}</div>);
		})}
	</div>)
}