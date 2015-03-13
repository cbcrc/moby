moby.renderBubble = function(data) {

	var that = this;

	var keywordsEntries = data.map(function(d, i) {
		return {key: d.name, value: d.values[0], data: d};
	});

	var sortKey = that.config.sortByKey;
	var pack = d3.layout.pack()
		.sort(function(a, b) {
			if (sortKey) {
				return d3.ascending(b.data[sortKey], a.data[sortKey]);
			}

			return d3.ascending(b.value, a.value);
		})
		.size([this.config.width, this.config.height])
		.padding(2)
		.value(function(d) { return d.value; });

	var colors = moby.utils.colorPicker();

	// containers
	var container = d3.select(this.config.containerSelector);

	var charts = container
		.selectAll('div.chart')
		.data([0]);
	charts.enter().append('div').attr({ 'class': 'bubble chart' });

	charts
		.style({
			width: this.config.width + 'px',
			height: this.config.height + 'px'
		});

	var translate = function(d) { return 'translate(' + (d.x - d.r) + 'px,' + (d.y - d.r) + 'px)'; };

	var bubbleTween = function tween(d, i, a) {
		return d3.interpolateString(this.style.webkitTransform, translate(d));
	};

	var nodes = charts.selectAll('.node')
		.data(pack.nodes({key: 'a', value: 1, children: keywordsEntries}));

	nodes.enter().append('div')
		.attr({'class': 'node'})
		.style({
			'-webkit-transform': translate,
			'transform': translate,
			width: 0 + 'px',
			height: 0 + 'px',
			'border-radius': function(d) { return d.r + 'px';}
		})
		.style({
			position: 'absolute',
			'text-align': 'center'
		})
		.on('mousemove', function(d, i) {
			d3.select(this).classed('hover', true);
			var mouse = d3.mouse(container.node());
			that.tooltip.show.call(that, {name: d.key, values: [d.value]}, {pos: mouse});
			that.events.hover.call(that, d, {pos: mouse});
		})
		.on('mouseout', function(d, i) {
			d3.select(this).classed('hover', false);
			var mouse = d3.mouse(container.node());
			that.tooltip.hide.call(that);
			that.events.hoverout.call(that, d, {pos: mouse});
		})
		.append('span').attr({'class': 'label-container'})
		.style({
			'font-size': 10 + 'px',
			'pointer-events': 'none',
			position: 'absolute',
			left: 0
		});

	nodes
		.transition()
		.duration(this.config.transitionDuration)
		.styleTween('-webkit-transform', bubbleTween)
		.styleTween('transform', bubbleTween)
		.style({
			width: function(d) { return d.r * 2 + 'px'; },
			height: function(d) { return d.r * 2 + 'px'; },
			'border-radius': function(d) { return d.r + 'px';},
			'background-color': function(d, i, pI) {
				var key = that.config.colorByKey;
				if (key && data[i - 1]) {
					return colors(data[i - 1][key]);
				}
				else {
					return null;
				}
			}
		})
		.each('end', function(d) {

			var text = that.config.labelFormatter({name: d.key, values: [d.value]});
			d3.select(this).select('.label-container')
				.html(text)
				.style({
					'font-size': function() {
						var fontSize = parseInt(this.style.fontSize, 10);
						return ~~(fontSize * (d.r * 2) / this.offsetWidth) * 0.9 + 'px';
					},
					'margin-top': function() {
						return d.r - this.offsetHeight / 2 + "px"
					},
					'margin-left': function() {
						return (d.r * 0.1) + "px"
					}
				})
				.filter(function() { return d.r < that.config.labelRadiusThreshold})
				.html('');

		});

	nodes.exit().remove();

	d3.select(nodes[0][0]).classed('top', true)
		.text('');

	return this;
};