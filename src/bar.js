moby.renderBar = function(data) {

	var that = this;

	var colors = moby.utils.colorPicker();

	// containers
	var container = d3.select(this.config.containerSelector);

	var charts = container
		.selectAll('div.chart')
		.data(data);

	charts.enter().append('div').attr({ 'class': 'bar chart' })
		.on('mousemove', function(d, i) {
			d3.select(this).select('.bar').classed('hover', true);
			var mouse = d3.mouse(container.node());
			that.tooltip.show.call(that, d, {pos: mouse});
			that.events.hover.call(that, d, {pos: mouse});
		})
		.on('mouseout', function(d, i) {
			d3.select(this).select('.bar').classed('hover', false);
			var mouse = d3.mouse(container.node());
			that.tooltip.hide.call(that);
			that.events.hoverout.call(that, d, {pos: mouse});
		});

	charts
		.style({
			width: this.config.width + 'px',
			height: this.config.height / data.length + 'px'
		});

	charts.exit().remove();

	var bar = charts.selectAll('div.bar').data(function(d) { return d.values;});

	bar.enter().append('div').attr({ 'class': 'bar' })
		.style({
			width: this.config.width + 'px',
			height: '100%'
		});

	bar
		.transition()
		.duration(this.config.transitionDuration)
		.style({
			width: function(d, i, pI) {
				return d / d3.max(d3.merge(data.map(function(d, i) { return d.values; }))) * that.config.width - 2 + 'px';
			},
			'background-color': function(d, i, pI){
				var key = that.config.colorByKey;
				if(key && data[pI]){
					return colors(data[pI][key]);
				}
				else {
					return null;
				}
			}
		});

	bar.exit().remove();

	// labels
	var label = charts.selectAll('div.label').data(function(d) { return [d];});

	label.enter().append('div').attr({ 'class': 'label' })
		.style({
			width: this.config.width + 'px',
			height: '100%',
			position: 'absolute'
		});

	label
		.style({
			width: this.config.width + 'px'
		})
		.html(this.config.labelFormatter);

	label.exit().remove();

};