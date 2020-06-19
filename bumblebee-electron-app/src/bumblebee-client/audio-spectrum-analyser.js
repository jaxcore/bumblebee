class SpectrumAnalyzer {
	constructor(analyser, canvas) {
		if (!canvas) {
			console.log('no canvas');
			return;
		}
		if (!analyser) {
			console.log('no analyser');
			return;
		}
		this.analyser = analyser;
		this.canvas = canvas;
		this.drawing = false;
		
		analyser.fftSize = 2048;
		this.bufferLength = analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.bufferLength);
		
		this.ctx = canvas.getContext('2d');
		this.setColors('#fff', '#000');
		this.ctx.lineWidth = 1.5;
		this._draw = this.draw.bind(this);
	}
	setColors(linecolor, bgcolor) {
		this.setLineColor(linecolor);
		this.setBackgroundColor(bgcolor);
	}
	setLineColor(linecolor) {
		if (linecolor) {
			this.ctx.strokeStyle = linecolor;
		}
	}
	setBackgroundColor(bgcolor) {
		this.bgColor = bgcolor;
	}
	clear() {
		const {canvas, ctx} = this;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	draw() {
		if (!this.drawing) {
			this.clear();
		}
		const {canvas, bufferLength, ctx} = this;
		this.analyser.getByteTimeDomainData(this.dataArray);
		
		if (this.bgColor) {
			ctx.fillStyle = this.bgColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		else {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		
		if (this.muted) {
			ctx.fillStyle = ctx.strokeStyle;
			ctx.font = '14px Arial';
			ctx.fillText('MUTED', canvas.width/2 - 25, canvas.height/2 - 10)
		}
		
		ctx.beginPath();
		
		var sliceWidth = canvas.width * 1.0 / bufferLength;
		var x = 0;
		
		for (var i = 0; i < bufferLength; i++) {
			var v = (this.dataArray[i] / 128.0),
				y = v * canvas.height / 2;
			
			if (i === 0) {
				ctx.moveTo(x, y);
			}
			else {
				ctx.lineTo(x, y);
			}
			x += sliceWidth;
		}
		
		ctx.lineTo(canvas.width, canvas.height / 2);
		ctx.stroke();
		
		if (this.drawing) {
			requestAnimationFrame(this._draw);
		}
		else {
			this.clear();
		}
	}
	start() {
		this.drawing = true;
		this.draw();
	}
	stop() {
		this.drawing = false;
		this.clear();
	}
	setMuted(muted) {
		this.muted = muted;
	}
}

module.exports = SpectrumAnalyzer;