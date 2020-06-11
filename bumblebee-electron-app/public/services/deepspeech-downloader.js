const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const electron = require('electron');

const ipcMain = require('electron').ipcMain;
const request = require('request');

class SpeechDownloader extends EventEmitter {
	constructor(bumblebeeElectron) {
		super();
		
		this.bumblebeeElectron = bumblebeeElectron;
		
		// this.deepSpeechModelUrl = 'https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/deepspeech-0.7.3-models.pbmm';
		// this.deepSpeechScorerUrl = 'https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/deepspeech-0.7.3-models.scorer';
		
		this.deepSpeechModelUrl = 'http://localhost:8000/deepspeech-0.7.3-models.pbmm';
		this.deepSpeechScorerUrl = 'http://localhost:8000/deepspeech-0.7.3-models.scorer';
		
		// /Users/dstein/Library/Application\ Support/com.jaxcore.bumblebee
		this.path = path.resolve(electron.app.getPath('appData'), 'com.jaxcore.bumblebee');
		
		this.modelsPath = path.resolve(this.path, 'deepspeech-0.7.3-models');
		this.file1path = this.modelsPath + '.pbmm';
		this.file2path = this.modelsPath + '.scorer';
		
		this.isInstalled = fs.existsSync(this.file1path) && fs.existsSync(this.file2path);
		this.bumblebeeElectron.setState({
			deepspeechInstalled: this.isInstalled
		});
		
		ipcMain.on('download-deepspeech', (event) => {
			this.startDownload();
		});
		
		ipcMain.on('download-deepspeech-cancel', (event) => {
			this.cancelDownload();
		});
	}
	
	startDownload() {
		if (!this.speechReq) {
			this.speechReq = this.downloadFile(1, this.deepSpeechModelUrl, this.file1path);
		}
	}
	
	cancelDownload() {
		if (this.speechReq) {
			this.speechReq._cancelled = true;
			this.speechReq.abort();
		}
	}
	
	downloadFile(file_num, file_url, targetPath) {
		console.log('downloadFile', file_url, targetPath);
		
		var received_bytes = 0;
		var total_bytes = 0;
		
		let updateInterval = setInterval(() => {
			console.log('received_bytes', received_bytes, ' / ', total_bytes);
			this.bumblebeeElectron.execFunction('speechDownloadProgress', [file_num, received_bytes, total_bytes]);
		},200);
		
		var req = request({
			method: 'GET',
			uri: file_url
		});
		
		var out = fs.createWriteStream(targetPath);
		req.pipe(out);
		
		req.on('response', (data) => {
			// Change the total bytes value to get progress later.
			total_bytes = parseInt(data.headers['content-length']);
		});
		
		req.on('error', (e) => {
			console.log('error', e);
			clearInterval(updateInterval);
		});
		
		req.on('data', (chunk) => {
			received_bytes += chunk.length;
		});
		
		req.on('end', () => {
			clearInterval(updateInterval);
			
			if (!this.speechReq) {
				debugger;
			}
			
			if (this.speechReq && this.speechReq._cancelled) {
				fs.unlink(targetPath, () => {
					console.log('deleted temp file', targetPath);
					delete this.speechReq;
				});
				this.emit('deepspeech-install-cancelled');
			}
			else {
				if (received_bytes === total_bytes) {
					this.downloadFileSuccess(file_num, targetPath, received_bytes, total_bytes);
				}
				else {
					this.emit('deepspeech-install-error');
				}
			}
		});
		
		return req;
	}
	
	downloadFileSuccess(file_num, targetPath, received_bytes, total_bytes) {
		console.log("File succesfully downloaded", targetPath);
		
		let done = false;
		
		if (file_num === 1) {
			this.speechReq = this.downloadFile(2, this.deepSpeechScorerUrl, this.file2path);
		}
		else if (file_num === 2) {
			this.isInstalled = fs.existsSync(this.file1path) && fs.existsSync(this.file2path);
			
			done = true;
			this.emit('deepspeech-installed');
		}
		
		this.bumblebeeElectron.execFunction('speechDownloadProgress', [file_num, received_bytes, total_bytes, done]);
		delete this.speechReq;
	}
}

module.exports = SpeechDownloader;