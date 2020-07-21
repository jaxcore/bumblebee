function recordStream(stream) {
	let rec = new MediaRecorder(stream);
	rec.ondataavailable = e => {
		audioChunks.push(e.data);
		if (rec.state == "inactive"){
			let blob = new Blob(audioChunks,{type:'audio/x-mpeg-3'});
			recordedAudio.src = URL.createObjectURL(blob);
			recordedAudio.controls=true;
			recordedAudio.autoplay=true;
			audioDownload.href = recordedAudio.src;
			audioDownload.download = 'mp3';
			audioDownload.innerHTML = 'download';
		}
	}
}

export {recordStream};