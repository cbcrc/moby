var moby = { version: '0.1.0' };

moby.idx = 0;

moby.init = function(config) {

	var dataCache = null;

	var renderers = {
		line: moby.renderLine,
		bar2D: moby.renderBar2D,
		bubble: moby.renderBubble,
		bar: moby.renderBar
	};

	var exports = {};

	exports.config = {
		containerSelector: null,
		width: 300,
		height: 200,
		type: 'bar',
		transitionDuration: 300,
		labelFormatter: moby.utils.formatLabel,
		tooltipFormatter: moby.utils.formatTooltip,
		colorByKey: null
	};

	exports.setConfig = function(newConfig) {
		moby.utils.override(newConfig, this.config);
		return this;
	};

	exports.setConfig(config);

	exports.events = d3.dispatch('hover', 'hoverout');

	exports.tooltip = moby.tooltip.call(exports);

	exports.render = function(data) {

		if (data) {
			dataCache = data;
		}
		else {
			data = dataCache;
		}
		var containerNode = d3.select(this.config.containerSelector).node();
		this.config.width = containerNode.offsetWidth;
		this.config.height = containerNode.offsetHeight;

		renderers[this.config.type].call(this, data);
		return this;
	};

	d3.rebind(exports, exports.events, 'on');

	d3.select(window).on('resize.' + moby.idx++, moby.utils.debounce(function() { exports.render(); }, 300));

	// public functions
	return exports;
};