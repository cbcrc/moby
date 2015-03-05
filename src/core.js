var moby = { version: '0.1.0' };

moby.idx = 0;

moby.init = function() {
	var config = {
		containerSelector: null,
		width: 300,
		height: 200,
		type: 'bar',
		transitionDuration: 200,
		labelFormatter: moby.utils.formatLabel
	};

	var dataCache = null;

	d3.select(window).on('resize.' + moby.idx++, moby.utils.debounce(function() { render(); }, 300));

	var renderers = {
		line: moby.renderLine,
		bar2D: moby.renderBar2D,
		bubble: moby.renderBubble,
		bar: moby.renderBar
	};

	var render = function(data) {

		if (data) {
			dataCache = data;
		}
		else {
			data = dataCache;
		}
		config.width = d3.select(config.containerSelector).node().offsetWidth;

		renderers[config.type](data, config);
		return this;
	};

	var setConfig = function(newConfig) {

		moby.utils.override(newConfig, config);
		return this;
	};

	// public functions
	return {
		render: render,
		setConfig: setConfig
	};
};