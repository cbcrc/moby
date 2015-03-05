moby.renderBubble = function(data, config) {

	var keywordsEntries = data.map(function(d, i) {
		return {key: d.name, value: d.values[0]};
	});

	var pack = d3.layout.pack()
		.sort(null)
		.size([config.width, config.height])
		.padding(2)
		.value(function(d) {return d.value; });

	// containers
	var charts = d3.select(config.containerSelector)
		.selectAll('div.chart')
		.data([0]);
	charts.enter().append('div').attr({ 'class': 'bubble chart' });

	charts
		.style({
			width: config.width + 'px',
			height: config.height + 'px'
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
			'transform': translate
		})
		.style({
			position: 'absolute',
			'text-align': 'center'
		});

	nodes
		.html(function(d) { return config.labelFormatter({name: d.key, values: [d.value]}); })
		.transition()
		.duration(config.transitionDuration)
		.styleTween('-webkit-transform', bubbleTween)
		.styleTween('transform', bubbleTween)
		.style({
			width: function(d) { return d.r * 2 + 'px'; },
			height: function(d) { return d.r * 2 + 'px'; },
			'border-radius': function(d) { return d.r + 'px';},
			'font-size': function(d) {
				return ~~(d.r / d.key.length) * 4 + 'px';
			},
			'padding-top': function(d, i) {
				if (i !== 0) {
					return ~~(d.r / d.key.length) * 4 + 'px';
				}
			}
		});

	nodes.exit().remove();

	d3.select(nodes[0][0]).classed('top', true)
		.text('');

	return this;
};