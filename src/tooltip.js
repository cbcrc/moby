moby.tooltip = function() {

	var exports = {};

	var tooltip = d3.select(this.config.containerSelector)
		.append('div').attr({'class': 'chart-tooltip'})
		.style({
			position: 'absolute',
			'pointer-events': 'none',
			display: 'none',
			'z-index': 10
		});

	exports.show = function(d, e) {
		var that = this;
		tooltip
			.style({
				left: e.pos[0] + 'px',
				top: e.pos[1] - 10 + 'px',
				display: 'block'
			})
			.html(function() {
				return that.config.tooltipFormatter(d);
			});
	};

	exports.hide = function() {
		tooltip
			.style({
				display: 'none'
			})
			.html('');
	};

	return exports;

};