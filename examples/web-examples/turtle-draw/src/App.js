import React, { useState, useEffect } from 'react';
import TurtleCanvas from './TurtleCanvas';
import Bumblebee from 'jaxcore-bumblebee';
import TurtleVoiceApp from './VoiceApp';

class App extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			connecting: false,
			connected: false,
			error: null
		};
		
		this.voiceApp = null;
	}
	
	componentDidMount() {
		this.connectApp();
	}
	
	connectApp() {
		(async () => {
			const {connected, connecting} = this.state;

			if (!connecting && !connected) {
				this.setState({connecting: true});
				try {
					const app = await Bumblebee.connectApplication(TurtleVoiceApp, {
						name: "Turtle Draw",
						autoStart: true
					});
					
					this.voiceApp = app;
					// debugger;
					this.setState({
						connected: true,
						connecting: false
					});
				}
				catch(e) {
					let error;
					if (e) {
						error = e.timeout?
							'Timed out.  Make sure the Bumblebee desktop app is running.' :
							JSON.stringify(e);
					}
					else {
						debugger;
					}
					this.setState({
						connected: false,
						connecting: false,
						error
					});
				}
			}
		})();
	}
	
	render() {
		const {connected, connecting, error} = this.state;
		
		if (error) {
			return 'Error: ' + error;
		}
		if (connecting) {
			return 'Connecting...';
		}
		if (connected) {
			if (this.voiceApp) {
				return (<TurtleCanvas voiceApp={this.voiceApp}/>);
			}
			else {
				debugger;
			}
		}
		
		// debugger;
		return 'loading';
	}
}

export default App;
