moby.renderLine = function(data, config) {

	var that = this;

	// containers
	var container = d3.select(this.config.containerSelector);

	var height = this.config.height / data.length;
	var charts = container
		.selectAll('div.chart')
		.data(data);

	charts.enter().append('div').attr({ 'class': 'line chart' });

	charts
		.style({
			width: this.config.width + 'px',
			height: height + 'px'
		});

	charts.exit().remove();

	// lines
	var lines = charts.selectAll('div.line')
		.data(function(d) { return d.values; });

	lines.enter().append('div').attr({'class': 'line'})
		.style({
			height: '2px',
			width: function(d, i, pI) {
				return that.config.width / data[pI].values.length + 'px';
			},
			left: function(d, i, pI) {
				var w = that.config.width / data[pI].values.length;
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
		var y = height - ( d * height / d3.max(parentData.values));
		var nextIdx = Math.min(i + 1, parentData.values.length - 1);
		var nextY = height - ( parentData.values[nextIdx] * height / d3.max(parentData.values));
		var h = nextY - y;
		var w = (that.config.width / parentData.values.length);

		return d3.interpolateString(this.style.webkitTransform, 'rotate(' + Math.atan2(h, w) + 'rad)');
	};

	lines
		.transition()
		.duration(this.config.transitionDuration)
		.styleTween('-webkit-transform', lineTween)
		.styleTween('transform', lineTween)
		.style({
			width: function(d, i, pI) {
				var parentData = this.parentNode.__data__;
				var y = height - ( d * height / d3.max(parentData.values));
				var nextIdx = Math.min(i + 1, parentData.values.length - 1);
				var nextY = height - ( parentData.values[nextIdx] * height / d3.max(parentData.values));
				var h = nextY - y;
				var w = (that.config.width / parentData.values.length);

				return Math.sqrt(h * h + w * w) + 'px';
			},
			top: function(d, i, pI) {
				return height - ( d * height / d3.max(data[pI].values)) + 'px';
			},
			left: function(d, i, pI) {
				var w = that.config.width / data[pI].values.length;
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
				var w = that.config.width / data[pI].values.length;
				return w * i - dotRadius + w / 2 + 'px';
			},
			top: function(d, i, pI) {
				return height - ( d * height / d3.max(data[pI].values)) - dotRadius + 'px';
			},
			width: dotRadius * 2 + 'px',
			height: dotRadius * 2 + 'px',
			'border-radius': dotRadius + 'px',
			position: 'absolute'
		})
		.on('mousemove', function(d, i, pI) {
			d3.select(this).classed('hover', true);
			var mouse = d3.mouse(container.node());
			that.tooltip.show.call(that, {name: data[pI].name, values: [d]}, {pos: mouse});
			that.events.hover.call(that, d, {pos: mouse});
		})
		.on('mouseout', function(d, i) {
			d3.select(this).classed('hover', false);
			var mouse = d3.mouse(container.node());
			that.tooltip.hide.call(that);
			that.events.hoverout.call(that, d, {pos: mouse});
		});

	dots
		.transition()
		.duration(this.config.transitionDuration)
		.style({
			left: function(d, i, pI) {
				var w = that.config.width / data[pI].values.length;
				return w * i - dotRadius + w / 2 + 'px';
			},
			top: function(d, i, pI) {
				return height - ( d * height / d3.max(data[pI].values)) - dotRadius + 'px';
			},
			width: dotRadius * 2 + 'px',
			height: dotRadius * 2 + 'px',
			'border-radius': dotRadius + 'px',
			position: 'absolute'
		});

	dots.exit().remove();

	// labels
	var labels = charts.selectAll('div.label')
		.data(function(d) { return d.values; });

	labels.enter().append('div')
		.attr({'class': 'label'})
		.style({
			left: function(d, i, pI) {
				var w = that.config.width / data[pI].values.length;
				return w * i + 'px';
			},
			top: function(d, i, pI) {
				var fontSize = parseInt(window.getComputedStyle(this).fontSize, 10);
				return height - fontSize + 'px';
			},
			position: 'absolute',
			'pointer-events': 'none'
		});

	labels
		.html(function(d, i, pI){
			return that.config.labelFormatter(data[pI], i);
		})
		.transition()
		.duration(this.config.transitionDuration)
		.style({
			left: function(d, i, pI) {
				var w = that.config.width / data[pI].values.length;
				return w * i + 'px';
			},
			top: function(d, i, pI) {
				var fontSize = parseInt(window.getComputedStyle(this).fontSize, 10);
				return height - fontSize + 'px';
			}
		});

	labels.exit().remove();

	return this;
};