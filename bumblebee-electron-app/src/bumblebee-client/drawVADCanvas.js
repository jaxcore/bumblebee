let data = [];

function clear(canvas) {
	const ctx = canvas.getContext('2d');
	const h = 9;
	const w = canvas.width;
	ctx.clearRect(0, 0, w, h);
}

function clearVADCanvas(canvas) {
	clear(canvas);
	data = [];
}

function drawVADCanvas(canvas, status) {
	const ctx = canvas.getContext('2d');
	if (status === 1) {
		let rh = 4 + Math.round(9*Math.random());
		data.unshift(rh);
	}
	else if (status === 2) {
		let rh = 2 + Math.round(6*Math.random());
		data.unshift(rh);
	}
	else data.unshift(status);
	// data.unshift(status);
	
	const h = 9;
	// const w = Math.floor(canvas.width / 2);
	const w = canvas.width;
	if (data.length > w) {
		data.length = w;
	}
	
	clear(canvas);
	
	data.forEach((d, i) => {
		const x = w - i;
		
		if (d === 0) {
			ctx.fillStyle = '#888';
			ctx.fillRect(x, 4, 1, 1);
		}
		else {
			if (d>8) ctx.fillStyle = '#bbb';
			else if (d > 6) ctx.fillStyle = '#999';
			else ctx.fillStyle = '#777';
			ctx.fillRect(x, (9-d)/2, 1, d);
		}
	});
}

module.exports = drawVADCanvas;
module.exports.clearVADCanvas = clearVADCanvas;