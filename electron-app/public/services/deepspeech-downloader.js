const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const electron = require('electron');

const ipcMain = require('electron').ipcMain;
const request = require('request');

const DEEPSPEECH_VERSION = '0.8.0';

class SpeechDownloader extends EventEmitter {
	constructor(bumblebeeElectron) {
		super();
		
		this.bumblebeeElectron = bumblebeeElectron;
		
		// const url = 'https://github.com/mozilla/DeepSpeech/releases/download/v'+DEEPSPEECH_VERSION;
		// this.deepSpeechModelUrl = url + '/deepspeech-'+DEEPSPEECH_VERSION+'-models.pbmm';
		// this.deepSpeechScorerUrl = url +'/deepspeech-'+DEEPSPEECH_VERSION+'-models.scorer';
		
		const server = 'http://localhost:8000';
		// const server = 'https://github.com/mozilla/DeepSpeech/releases/download/v'+DEEPSPEECH_VERSION;
		
		this.deepSpeechModelUrl = server + '/deepspeech-'+DEEPSPEECH_VERSION+'-models.pbmm';
		this.deepSpeechScorerUrl = server + '/deepspeech-'+DEEPSPEECH_VERSION+'-models.scorer';
		
		// /Users/dstein/Library/Application\ Support/com.jaxcore.bumblebee
		
		const localPath = path.resolve(__dirname + '/../../deepspeech-'+DEEPSPEECH_VERSION+'-models');
		const hasLocalModels = fs.existsSync(localPath + '.pbmm') && fs.existsSync(localPath + '.scorer');
		
		if (hasLocalModels) {
			this.modelsPath = localPath;
			this.isInstalled = true;
			this.bumblebeeElectron.setState({
				deepspeechInstalled: true,
				deepspeechLocalModels: true
			});
			console.log('deepspeech localModels');
			return;
		}
		
		this.path = path.resolve(electron.app.getPath('appData'), 'com.jaxcore.bumblebee');
		console.log('appData:', this.path);
		this.modelsPath = path.resolve(this.path, 'deepspeech-'+DEEPSPEECH_VERSION+'-models');
		this.file1path = this.modelsPath + '.pbmm';
		this.file2path = this.modelsPath + '.scorer';
		
		let old_path = path.resolve(this.path, 'deepspeech-0.7.4-models');
		if (fs.existsSync(old_path+'.pbmm')) {
			fs.unlinkSync(old_path+'.pbmm');
			console.log('deleted', old_path+'.pbmm')
		}
		if (fs.existsSync(old_path+'.scorer')) {
			fs.unlinkSync(old_path+'.scorer');
			console.log('deleted', old_path+'.scorer')
		}
		
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