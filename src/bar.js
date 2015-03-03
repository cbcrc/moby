moby.renderBar = function(data, config) {

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
				return d / d3.max(d3.merge(data.map(function(d, i) { return d.values; }))) * config.width - 2 + 'px';
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