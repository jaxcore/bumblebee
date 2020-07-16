const numerizer = require('numerizer');

function parseInteger(text) {
	text = makeReplacements(text, {
		'two': 'to',
		'four': 'for',
		'three': 'tree',
		'one': 'pon'
	});
	let nums = numerizer(text).toString();
	nums = nums.replace(/ /g,'');
	let num = parseInt(nums);
	if (isNaN(num)) return null;
	return num;
}

function makeReplacements(text, corrections) {
	for (let key in corrections) {
		let r = '(?<=\\s|^)('+corrections[key]+')(?=\\s|$)';
		text = text.replace(new RegExp(r, 'gi'), function (m, a) {
			return key;
		});
	}
	return text.trim();
}

module.exports = numerizer;
module.exports.parseInteger = parseInteger;
module.exports.makeReplacements = makeReplacements;