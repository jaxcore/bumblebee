const data = [];

function drawVADCanvas(canvas, status) {
	const ctx = canvas.getContext('2d');
	if (status === 2) {
		let rh = 4 + Math.round(5*Math.random());
		data.unshift(rh);
	}
	else data.unshift(status);
	
	const h = 9;
	// const w = Math.floor(canvas.width / 2);
	const w = canvas.width;
	if (data.length > w) {
		data.length = w;
	}
	//console.log('draw', status, canvas.width);
	ctx.clearRect(0, 0, w, h);
	data.forEach((d, i) => {
		const x = w - i;
		
		if (d === 0) {
			ctx.fillStyle = '#888'; //'#fff';
			// ctx.fillStyle = '#fff';
			// ctx.fillStyle = '#ddd';
			ctx.fillRect(x, 4, 1, 1);
		}
		else if (d === 1) {
			ctx.fillStyle = '#444'; //'#aaa';
			// ctx.fillStyle = '#aaa';
			// ctx.fillStyle = '#aaa';
			ctx.fillRect(x, 3, 1, 3);
		}
		else {
			ctx.fillStyle = '#999'; //'#fff';
			// ctx.fillStyle = '#fff';
			// ctx.fillStyle = '#ddd';
			// (d - 4) / 2
			ctx.fillRect(x, (9-d)/2, 1, d);
			// ctx.fillRect(x, 0, 1, 9);
		}
	});
}
module.exports = drawVADCanvas;