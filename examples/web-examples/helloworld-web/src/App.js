import React from 'react';

import Bumblebee from 'jaxcore-bumblebee';

class HelloWorldApp extends Bumblebee.Application {
	constructor() {
		super(...arguments);
	}
	
	async onBegin() {
		await this.playSound('warn');
	}
	
	async loop() {
		this.console('Say "Hello World"');
		
		let recognition = await this.recognize();
		this.console(recognition);
		
		if (recognition.text === 'hello world') {
			await this.playSound('okay');
			await this.say('Hello World');
			
			this.emit('success');
		}
		else {
			await this.playSound('error');
			
			this.emit('error', recognition.text);
		}
	}
}


class App extends React.Component {
	constructor() {
		super();
		this.state = {
			loaded: true,
			error: null,
			logs: []
		};
	}
	
	componentDidMount() {
		this.loadApp().then(application => {
			this.setState({
				loaded: true
			});
		}).catch(e => {
			this.setState({
				error: 'could not load app'
			});
		})
	}
	
	async loadApp() {
		const application = await Bumblebee.connectApplication(HelloWorldApp, {
			name: "Hello World",
			autoStart: true
		});
		application.on('success', () => {
		  // debugger;
			const logs = this.state.logs;
			logs.push('HELLO WORLD!');
			this.setState({logs});
		});
		application.on('error', (text) => {
          // debugger;
			const logs = this.state.logs;
			logs.push('Not Recognized: ' + text);
			this.setState({logs});
		});
		return application;
	}
	
	render() {
		if (this.state.error) {
			return this.state.error;
		}
		if (this.state.loading) {
			return 'loading...';
		}
		
		return (
			<div className="App">
				<h3>Say "hello world"</h3>
				<ul>
					{
                      this.state.logs.map((log, index) => {
                        return (<li key={index}>{log}</li>);
                      })
                    }
				</ul>
			</div>
		);
	}
}

export default App;
