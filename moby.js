var moby = (function(d3) {

	// utilities
	var formatLabel = function(d) {
		var labelContent = '';
		if (d.name) {
			labelContent += d.name;
		}
		if (d.values) {
			labelContent += '<span class="value">(' + d3.max(d.values) + ')</span>';
		}

		return labelContent;
	};

	var generateRandomString = function() {
		return d3.range(~~(Math.random() * 20) + 5).map(function(d, i) {
			return String.fromCharCode(Math.random() * 26 + 65);
		}).join('');
	};

	var generateData1D = function(rows) {
		return d3.range(rows).map(function(d, i) {
			return {
				name: generateRandomString(),
				values: [~~(Math.random() * 100)]
			};
		});
	};

	var generateData2D = function(rows, cols) {
		return d3.range(rows).map(function() {
			return {
				name: generateRandomString(),
				values: d3.range(cols).map(function() {
					return ~~(Math.random() * 100);
				})
			};
		})
	};

	function debounce(a, b, c) {
		var d;
		return function() {
			var e = this, f = arguments;
			clearTimeout(d), d = setTimeout(function() {d = null, c || a.apply(e, f)}, b), c && !d && a.apply(e, f)
		}
	}

	var override = function(_objA, _objB) { for (var x in _objA) { if (x in _objB) { _objB[x] = _objA[x]; } } };

	var idx = 0;

	var exports = function() {
		var config = {
			containerSelector: null,
			width: 300,
			height: 200,
			type: 'bar',
			transitionDuration: 200,
			labelFormatter: formatLabel
		};

		var dataCache = null;

		d3.select(window).on('resize.' + idx++, debounce(function() { render(); }, 300));

		var renderLine = function(data) {

			// containers
			var charts = d3.select(config.containerSelector)
				.selectAll('div.chart')
				.data(data);

			charts.enter().append('div').attr({ 'class': 'chart' });

			charts
				.style({
					width: config.width + 'px',
					height: config.height + 'px'
				});

			charts.exit().remove();

			// lines
			var lines = charts.selectAll('div.line')
				.data(function(d) { return d.values; });

			lines.enter().append('div').attr({'class': 'line'})
				.style({
					height: '2px',
					width: function(d, i, pI) {
						return config.width / data[pI].values.length + 'px';
					},
					left: function(d, i, pI) {
						var w = config.width / data[pI].values.length;
						return w * i + w / 2 + 'px';
					},
					'-webkit-transform-origin': '0% 0%',
					'transform-origin': '0% 0%',
					'-webkit-transform': 'rotate(0rad)',
					position: 'absolute'
				});

			lines
				.transition()
				.duration(config.transitionDuration)
				.styleTween('-webkit-transform', function tween(d, i, a) {

					var parentData = this.parentNode.__data__;
					var y = config.height - ( d * config.height / d3.max(parentData.values));
					var nextIdx = Math.min(i + 1, parentData.values.length - 1);
					var nextY = config.height - ( parentData.values[nextIdx] * config.height / d3.max(parentData.values));
					var h = nextY - y;
					var w = (config.width / parentData.values.length);

					return d3.interpolateString(this.style.webkitTransform, 'rotate(' + Math.atan2(h, w) + 'rad)');
				})
				.styleTween('transform', function tween(d, i, a) {
					var parentData = this.parentNode.__data__;
					var y = config.height - ( d * config.height / d3.max(parentData));
					var nextIdx = Math.min(i + 1, parentData.values.length - 1);
					var nextY = config.height - ( parentData.values[nextIdx] * config.height / d3.max(parentData.values));
					var h = nextY - y;
					var w = (config.width / parentData.length);

					return d3.interpolateString(this.style.transform, 'rotate(' + Math.atan2(h, w) + 'rad)');
				})
				.style({
					width: function(d, i, pI) {
						var parentData = this.parentNode.__data__;
						var y = config.height - ( d * config.height / d3.max(parentData.values));
						var nextIdx = Math.min(i + 1, parentData.values.length - 1);
						var nextY = config.height - ( parentData.values[nextIdx] * config.height / d3.max(parentData.values));
						var h = nextY - y;
						var w = (config.width / parentData.values.length);

						return Math.sqrt(h * h + w * w) + 'px';
					},
					top: function(d, i, pI) {
						return config.height - ( d * config.height / d3.max(data[pI].values)) + 'px';
					},
					left: function(d, i, pI) {
						var w = config.width / data[pI].values.length;
						return w * i + w / 2 + 'px';
					},
					display: function(d, i, pI) { return i === data[pI].values.length - 1 ? 'none' : 'block'; }
				});

			lines.exit().remove();

			// dots
			var dotRadius = 5;
			var dots = charts.selectAll('div.dot')
				.data(function(d) { return d.values; });

			dots.enter().append('div').attr({'class': 'dot'})
				.style({
					left: function(d, i, pI) {
						var w = config.width / data[pI].values.length;
						return w * i - dotRadius + w / 2 + 'px';
					},
					top: function(d, i, pI) {
						return config.height - ( d * config.height / d3.max(data[pI].values)) - dotRadius + 'px';
					},
					width: dotRadius * 2 + 'px',
					height: dotRadius * 2 + 'px',
					'border-radius': dotRadius + 'px',
					position: 'absolute'
				});

			dots
				.transition()
				.duration(config.transitionDuration)
				.style({
					left: function(d, i, pI) {
						var w = config.width / data[pI].values.length;
						return w * i - dotRadius + w / 2 + 'px';
					},
					top: function(d, i, pI) {
						return config.height - ( d * config.height / d3.max(data[pI].values)) - dotRadius + 'px';
					},
					width: dotRadius * 2 + 'px',
					height: dotRadius * 2 + 'px',
					'border-radius': dotRadius + 'px',
					position: 'absolute'
				});

			dots.exit().remove();

			// labels
			var label = charts.selectAll('div.label').data(function(d) { return [d];});

			label.enter().append('div').attr({ 'class': 'label' })
				.style({
					width: config.width + 'px',
					height: config.height - 2 + 'px',
					position: 'absolute'
				});

			label.html(config.labelFormatter);

			label.exit().remove();

			return this;
		};

		var renderBars = function(data) {

			// containers
			var charts = d3.select(config.containerSelector)
				.selectAll('div.chart')
				.data(data);

			charts.enter().append('div').attr({ 'class': 'chart' });

			charts
				.style({
					width: config.width + 'px',
					height: config.height + 'px'
				});

			charts.exit().remove();

			// bars
			var bars = charts.selectAll('div.barv')
				.data(function(d) { return d.values; });

			bars.enter().append('div').attr({'class': 'barv'})
				.style({
					left: function(d, i, pI) { return i * config.width / data[pI].values.length + 'px'; },
					top: config.height + 'px',
					width: function(d, i, pI) { return config.width / data[pI].values.length + 'px'; },
					height: 0 + 'px',
					position: 'absolute'
				});

			bars
				.transition()
				.duration(config.transitionDuration)
				.style({
					left: function(d, i, pI) { return i * config.width / data[pI].values.length + 'px'; },
					top: function(d, i, pI) {
						return config.height - ( d * config.height / d3.max(data[pI].values)) + 'px';
					},
					width: function(d, i, pI) { return config.width / data[pI].values.length - 2 + 'px'; },
					height: function(d, i, pI) { return d / d3.max(data[pI].values) * config.height - 2 + 'px'; }
				});

			bars.exit().remove();

			// labels
			var bar = charts.selectAll('div.label').data(function(d) { return [d];});

			bar.enter().append('div').attr({ 'class': 'label' })
				.style({
					width: config.width + 'px',
					height: config.height - 2 + 'px',
					position: 'absolute'
				});

			bar.html(config.labelFormatter);

			bar.exit().remove();

			return this;
		};

		var renderBar = function(data) {

			// containers
			var charts = d3.select(config.containerSelector)
				.selectAll('div.chart')
				.data(data);

			charts.enter().append('div').attr({ 'class': 'chart' });

			charts
				.style({
					width: config.width + 'px',
					height: config.height + 'px'
				});

			charts.exit().remove();

			var bar = charts.selectAll('div.barh').data(function(d) { return d.values;});

			bar.enter().append('div').attr({ 'class': 'barh' })
				.style({
					width: config.width + 'px',
					height: config.height - 2 + 'px'
				});

			bar
				.transition()
				.duration(config.transitionDuration)
				.style({
					width: function(d, i, pI) {
						return d / d3.max(d3.merge(data.map(function(d, i){ return d.values; }))) * config.width - 2 + 'px';
					}
				});

			bar.exit().remove();

			// labels
			var label = charts.selectAll('div.label').data(function(d) { return [d];});

			label.enter().append('div').attr({ 'class': 'label' })
				.style({
					width: config.width + 'px',
					height: config.height - 2 + 'px',
					position: 'absolute'
				});

			label
				.style({
					width: config.width + 'px'
				})
				.html(config.labelFormatter);

			label.exit().remove();

		};

		var renderers = {
			line: renderLine,
			bars: renderBars,
			bar: renderBar
		};

		var render = function(data) {
			if (data) {
				dataCache = data;
			}
			else {
				data = dataCache;
			}
			config.width = d3.select(config.containerSelector).node().offsetWidth;

			renderers[config.type](data);
			return this;
		};

		var setConfig = function(newConfig) {
			override(newConfig, config);
			return this;
		};

		// public functions
		return {
			render: render,
			setConfig: setConfig
		};
	};

	// static functions
	exports.generateData1D = generateData1D;
	exports.generateData2D = generateData2D;
	exports.debounce = debounce;

	return exports;

})(d3);