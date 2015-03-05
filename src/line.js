moby.renderLine = function(data, config) {

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
			'transform': 'rotate(0rad)',
			position: 'absolute'
		});

	var lineTween = function tween(d, i, a) {
		var parentData = this.parentNode.__data__;
		var y = config.height - ( d * config.height / d3.max(parentData.values));
		var nextIdx = Math.min(i + 1, parentData.values.length - 1);
		var nextY = config.height - ( parentData.values[nextIdx] * config.height / d3.max(parentData.values));
		var h = nextY - y;
		var w = (config.width / parentData.values.length);

		return d3.interpolateString(this.style.webkitTransform, 'rotate(' + Math.atan2(h, w) + 'rad)');
	};

	lines
		.transition()
		.duration(config.transitionDuration)
		.styleTween('-webkit-transform', lineTween)
		.styleTween('transform', lineTween)
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