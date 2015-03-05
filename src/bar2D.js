moby.renderBar2D = function(data, config) {

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

	bars.enter().append('div')
		.attr({'class': 'barv'})
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