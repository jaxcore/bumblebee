const _numberize = require('numberize');

function numberize(text) {
	text = makeReplacements(text, {
		'two': 'to|too',
		'four': 'for',
		'three': 'tree',
		'one': 'pon'
	});
	return _numberize(text).toString();
}

function parseInteger(text) {
	let nums = numberize(text);
	nums = nums.replace(/ /g, '');
	let num = parseInt(nums);
	if (isNaN(num)) return null;
	return num;
}

function makeReplacements(text, corrections) {
	for (let key in corrections) {
		let r = '(?<=\\s|^)(' + corrections[key] + ')(?=\\s|$)';
		text = text.replace(new RegExp(r, 'gi'), function (m, a) {
			return key;
		});
	}
	return text.trim();
}

function sanitize(text) {
	return text.toLowerCase().replace(/[^a-z0-9|']+/gi, " ").replace(/ +/, " ").trim();
}

module.exports.numberize = numberize;
module.exports.sanitize = sanitize;
module.exports.parseInteger = parseInteger;
module.exports.makeReplacements = makeReplacements;