const executeFunction = (win, functionName, args, callback) => {
	let jargs = args.map(JSON.stringify);
	let codeStr = 'if (typeof '+functionName+' === "function") '+functionName+'(' + jargs.join(',') + ')';
	executeJavaScript(win, codeStr, callback);
};

const executeJavaScript = (win, codeStr, callback) => {
	// BEWARE:
	// executing "codeStr" is potentially harmful
	// it is recommented to only call functions with parameters encoded as JSON using JSON.stringify()
	if (win.webContents && win.webContents.executeJavaScript) {
		try {
			win.webContents.executeJavaScript(codeStr).then((result) => {
				if (callback) callback(result);
			}).catch((e) => {
				console.error('executeJavaScript', e);
			});
		} catch (e) {
			console.erroor('executeJavaScript', e);
			process.exit();
		}
	}
	else {
		console.error('no webContents');
		process.exit();
	}
};

module.exports = executeFunction;