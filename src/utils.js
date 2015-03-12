// utilities
moby.utils = {};

moby.utils.formatLabel = function(d) {
	var labelContent = '';
	if (d.name) {
		labelContent += '<span class="label-title">' + d.name + '</span>';
	}
	if (d.values) {
		labelContent += '<span class="label-value"> (' + d3.max(d.values) + ')</span>';
	}

	return labelContent;
};

moby.utils.formatTooltip = function(d) {
	var tooltipContent = '';
	if (d.name) {
		tooltipContent += '<span class="label-title">' + d.name + '</span>';
	}
	if (d.values) {
		tooltipContent += '<span class="label-value"> (' + d3.max(d.values) + ')</span>';
	}

	return tooltipContent;
};

moby.utils.generateRandomString = function() {
	return d3.range(~~(Math.random() * 20) + 5).map(function(d, i) {
		return String.fromCharCode(Math.random() * 26 + 65);
	}).join('');
};

moby.utils.generateData1D = function(rows) {
	return d3.range(rows).map(function(d, i) {
		return {
			name: moby.utils.generateRandomString(),
			values: [~~(Math.random() * 100)]
		};
	});
};

moby.utils.generateData2D = function(rows, cols) {
	return d3.range(rows).map(function() {
		return {
			name: moby.utils.generateRandomString(),
			values: d3.range(cols).map(function() {
				return ~~(Math.random() * 100);
			})
		};
	})
};

moby.utils.debounce = function(a, b, c) {
	var d;
	return function() {
		var e = this, f = arguments;
		clearTimeout(d), d = setTimeout(function() {d = null, c || a.apply(e, f)}, b), c && !d && a.apply(e, f)
	}
};

moby.utils.override = function(_objA, _objB) { for (var x in _objA) { if (x in _objB) { _objB[x] = _objA[x]; } } };

moby.utils.colorPicker = d3.scale.category20;