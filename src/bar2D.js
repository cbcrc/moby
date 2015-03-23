// Copyright (c) CBC/Radio-Canada. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

moby.renderBar2D = function(data) {

	var that = this;

	// containers
	var container = d3.select(this.config.containerSelector);

	var height = this.config.height / data.length;
	var charts = container
		.selectAll('div.chart')
		.data(data);

	charts.enter().append('div').attr({ 'class': 'bar2d chart' });

	charts
		.style({
			width: this.config.width + 'px',
			height: height + 'px'
		});

	charts.exit().remove();

	// bars
	var bars = charts.selectAll('div.bar')
		.data(function(d) { return d.values; });

	bars.enter().append('div')
		.attr({'class': 'bar'})
		.style({
			left: function(d, i, pI) { return i * that.config.width / data[pI].values.length + 'px'; },
			top: height + 'px',
			width: function(d, i, pI) { return that.config.width / data[pI].values.length + 'px'; },
			height: 0 + 'px',
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

	bars
		.transition()
		.duration(this.config.transitionDuration)
		.style({
			left: function(d, i, pI) { return i * that.config.width / data[pI].values.length + 'px'; },
			top: function(d, i, pI) {
				return height - ( d * height / d3.max(data[pI].values)) + 'px';
			},
			width: function(d, i, pI) { return that.config.width / data[pI].values.length - 2 + 'px'; },
			height: function(d, i, pI) { return d / d3.max(data[pI].values) * height - 2 + 'px'; }
		});

	bars.exit().remove();


	// labels
	var labels = charts.selectAll('div.label')
		.data(function(d) { return d.values; });

	labels.enter().append('div')
		.attr({'class': 'label'})
		.style({
			left: function(d, i, pI) { return i * that.config.width / data[pI].values.length + 'px'; },
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
                var barW = that.config.width / data[pI].values.length;
                return i * barW + barW / 10 + "px";
            },
			top: function(d, i, pI) {
				var fontSize = parseInt(window.getComputedStyle(this).fontSize, 10);
				return height - fontSize * 1.4 + 'px';
			}
		});

	labels.exit().remove();

	return this;
};