// Copyright (c) CBC/Radio-Canada. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

var moby = {
    version: "0.1.0"
};

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
        type: "bar",
        transitionDuration: 400,
        labelFormatter: moby.utils.formatLabel,
        tooltipFormatter: moby.utils.formatTooltip,
        colorByKey: null,
        sortByKey: null,
        labelRadiusThreshold: 20,
        colors: null
    };
    exports.setConfig = function(newConfig) {
        moby.utils.override(newConfig, this.config);
        return this;
    };
    exports.setConfig(config);
    exports.events = d3.dispatch("hover", "hoverout", "click");
    exports.tooltip = moby.tooltip.call(exports);
    exports.render = function(data) {
        if (data) {
            dataCache = data;
        } else {
            data = dataCache;
        }
        var containerNode = d3.select(this.config.containerSelector).node();
        this.config.width = containerNode.offsetWidth;
        this.config.height = containerNode.offsetHeight;
        renderers[this.config.type].call(this, data);
        return this;
    };
    d3.rebind(exports, exports.events, "on");
    d3.select(window).on("resize." + moby.idx++, moby.utils.debounce(function() {
        exports.render();
    }, 300));
    return exports;
};

moby.utils = {};

moby.utils.formatLabel = function(d) {
    var labelContent = "";
    if (d.name) {
        labelContent += '<span class="label-title">' + d.name + "</span>";
    }
    if (d.values) {
        labelContent += '<span class="label-value"> (' + d3.max(d.values) + ")</span>";
    }
    return labelContent;
};

moby.utils.formatTooltip = function(d) {
    var tooltipContent = "";
    if (d.name) {
        tooltipContent += '<span class="label-title">' + d.name + "</span>";
    }
    if (d.values) {
        tooltipContent += '<span class="label-value"> (' + d3.max(d.values) + ")</span>";
    }
    return tooltipContent;
};

moby.utils.generateRandomString = function() {
    return d3.range(~~(Math.random() * 20) + 5).map(function(d, i) {
        return String.fromCharCode(Math.random() * 26 + 65);
    }).join("");
};

moby.utils.generateData1D = function(rows) {
    return d3.range(rows).map(function(d, i) {
        return {
            name: moby.utils.generateRandomString(),
            values: [ ~~(Math.random() * 100) ]
        };
    });
};

moby.utils.generateData2D = function(rows, cols) {
    return d3.range(rows).map(function() {
        return {
            name: moby.utils.generateRandomString(),
            values: d3.range(cols).map(function() {
                return ~~(Math.random() * 100);
            })
        };
    });
};

moby.utils.debounce = function(a, b, c) {
    var d;
    return function() {
        var e = this, f = arguments;
        clearTimeout(d), d = setTimeout(function() {
            d = null, c || a.apply(e, f);
        }, b), c && !d && a.apply(e, f);
    };
};

moby.utils.override = function(_objA, _objB) {
    for (var x in _objA) {
        if (x in _objB) {
            _objB[x] = _objA[x];
        }
    }
};

moby.utils.colorPicker = d3.scale.category20;

moby.tooltip = function() {
    var exports = {};
    var tooltip = d3.select(this.config.containerSelector).append("div").attr({
        "class": "chart-tooltip"
    }).style({
        position: "absolute",
        "pointer-events": "none",
        display: "none",
        "z-index": 10
    });
    exports.show = function(d, e) {
        var that = this;
        tooltip.style({
            left: e.pos[0] + "px",
            top: e.pos[1] - 10 + "px",
            display: "block"
        }).html(function() {
            return that.config.tooltipFormatter(d);
        });
    };
    exports.hide = function() {
        tooltip.style({
            display: "none"
        }).html("");
    };
    return exports;
};

moby.renderLine = function(data, config) {
    var that = this;
    var container = d3.select(this.config.containerSelector);
    var height = this.config.height / data.length;
    var charts = container.selectAll("div.chart").data(data);
    charts.enter().append("div").attr({
        "class": "line chart"
    });
    charts.style({
        width: this.config.width + "px",
        height: height + "px"
    });
    charts.exit().remove();
    var lines = charts.selectAll("div.line").data(function(d) {
        return d.values;
    });
    lines.enter().append("div").attr({
        "class": "line"
    }).style({
        height: "2px",
        width: function(d, i, pI) {
            return that.config.width / data[pI].values.length + "px";
        },
        left: function(d, i, pI) {
            var w = that.config.width / data[pI].values.length;
            return w * i + w / 2 + "px";
        },
        "-webkit-transform-origin": "0% 0%",
        "transform-origin": "0% 0%",
        "-webkit-transform": "rotate(0rad)",
        transform: "rotate(0rad)",
        position: "absolute"
    });
    var lineTween = function tween(d, i, a) {
        var parentData = this.parentNode.__data__;
        var y = height - d * height / d3.max(parentData.values);
        var nextIdx = Math.min(i + 1, parentData.values.length - 1);
        var nextY = height - parentData.values[nextIdx] * height / d3.max(parentData.values);
        var h = nextY - y;
        var w = that.config.width / parentData.values.length;
        return d3.interpolateString(this.style.webkitTransform, "rotate(" + Math.atan2(h, w) + "rad)");
    };
    lines.transition().duration(this.config.transitionDuration).styleTween("-webkit-transform", lineTween).styleTween("transform", lineTween).style({
        width: function(d, i, pI) {
            var parentData = this.parentNode.__data__;
            var y = height - d * height / d3.max(parentData.values);
            var nextIdx = Math.min(i + 1, parentData.values.length - 1);
            var nextY = height - parentData.values[nextIdx] * height / d3.max(parentData.values);
            var h = nextY - y;
            var w = that.config.width / parentData.values.length;
            return Math.sqrt(h * h + w * w) + "px";
        },
        top: function(d, i, pI) {
            return height - d * height / d3.max(data[pI].values) + "px";
        },
        left: function(d, i, pI) {
            var w = that.config.width / data[pI].values.length;
            return w * i + w / 2 + "px";
        },
        display: function(d, i, pI) {
            return i === data[pI].values.length - 1 ? "none" : "block";
        }
    });
    lines.exit().remove();
    var dotRadius = 5;
    var dots = charts.selectAll("div.dot").data(function(d) {
        return d.values;
    });
    dots.enter().append("div").attr({
        "class": "dot"
    }).style({
        left: function(d, i, pI) {
            var w = that.config.width / data[pI].values.length;
            return w * i - dotRadius + w / 2 + "px";
        },
        top: function(d, i, pI) {
            return height - d * height / d3.max(data[pI].values) - dotRadius + "px";
        },
        width: dotRadius * 2 + "px",
        height: dotRadius * 2 + "px",
        "border-radius": dotRadius + "px",
        position: "absolute"
    }).on("mousemove", function(d, i, pI) {
        d3.select(this).classed("hover", true);
        var mouse = d3.mouse(container.node());
        that.tooltip.show.call(that, {
            name: data[pI].name,
            values: [ d ]
        }, {
            pos: mouse
        });
        that.events.hover.call(that, d, {
            pos: mouse
        });
    }).on("mouseout", function(d, i) {
        d3.select(this).classed("hover", false);
        var mouse = d3.mouse(container.node());
        that.tooltip.hide.call(that);
        that.events.hoverout.call(that, d, {
            pos: mouse
        });
    });
    dots.transition().duration(this.config.transitionDuration).style({
        left: function(d, i, pI) {
            var w = that.config.width / data[pI].values.length;
            return w * i - dotRadius + w / 2 + "px";
        },
        top: function(d, i, pI) {
            return height - d * height / d3.max(data[pI].values) - dotRadius + "px";
        },
        width: dotRadius * 2 + "px",
        height: dotRadius * 2 + "px",
        "border-radius": dotRadius + "px",
        position: "absolute"
    });
    dots.exit().remove();
    var labels = charts.selectAll("div.label").data(function(d) {
        return d.values;
    });
    labels.enter().append("div").attr({
        "class": "label"
    }).style({
        left: function(d, i, pI) {
            var w = that.config.width / data[pI].values.length;
            return w * i + "px";
        },
        top: function(d, i, pI) {
            var fontSize = parseInt(window.getComputedStyle(this).fontSize, 10);
            return height - fontSize + "px";
        },
        position: "absolute",
        "pointer-events": "none"
    });
    labels.html(function(d, i, pI) {
        return that.config.labelFormatter(data[pI], i);
    }).transition().duration(this.config.transitionDuration).style({
        left: function(d, i, pI) {
            var w = that.config.width / data[pI].values.length;
            return w * i + "px";
        },
        top: function(d, i, pI) {
            var fontSize = parseInt(window.getComputedStyle(this).fontSize, 10);
            return height - fontSize + "px";
        }
    });
    labels.exit().remove();
    return this;
};

moby.renderBar = function(data) {
    var that = this;
    var colors = this.config.colors || moby.utils.colorPicker();
    var container = d3.select(this.config.containerSelector);
    var charts = container.selectAll("div.chart").data(data);
    charts.enter().append("div").attr({
        "class": "bar chart"
    }).on("mousemove", function(d, i) {
        d3.select(this).select(".bar").classed("hover", true);
        var mouse = d3.mouse(container.node());
        that.tooltip.show.call(that, d, {
            pos: mouse
        });
        that.events.hover.call(that, d, {
            pos: mouse
        });
    }).on("mouseout", function(d, i) {
        d3.select(this).select(".bar").classed("hover", false);
        var mouse = d3.mouse(container.node());
        that.tooltip.hide.call(that);
        that.events.hoverout.call(that, d, {
            pos: mouse
        });
    });
    charts.style({
        width: this.config.width + "px",
        height: this.config.height / data.length + "px"
    });
    charts.exit().remove();
    var bar = charts.selectAll("div.bar").data(function(d) {
        return d.values;
    });
    bar.enter().append("div").attr({
        "class": "bar"
    }).style({
        width: this.config.width + "px",
        height: "100%"
    });
    bar.transition().duration(this.config.transitionDuration).style({
        width: function(d, i, pI) {
            return d / d3.max(d3.merge(data.map(function(d, i) {
                return d.values;
            }))) * that.config.width - 2 + "px";
        },
        "background-color": function(d, i, pI) {
            var key = that.config.colorByKey;
            if (key && data[pI]) {
                return colors(data[pI][key]);
            } else {
                return null;
            }
        }
    });
    bar.exit().remove();
    var label = charts.selectAll("div.label").data(function(d) {
        return [ d ];
    });
    label.enter().append("div").attr({
        "class": "label"
    }).style({
        width: this.config.width + "px",
        height: "100%",
        position: "absolute"
    });
    label.style({
        width: this.config.width + "px"
    }).html(this.config.labelFormatter);
    label.exit().remove();
};

moby.renderBar2D = function(data) {
    var that = this;
    var container = d3.select(this.config.containerSelector);
    var height = this.config.height / data.length;
    var charts = container.selectAll("div.chart").data(data);
    charts.enter().append("div").attr({
        "class": "bar2d chart"
    });
    charts.style({
        width: this.config.width + "px",
        height: height + "px"
    });
    charts.exit().remove();
    var bars = charts.selectAll("div.bar").data(function(d) {
        return d.values;
    });
    bars.enter().append("div").attr({
        "class": "bar"
    }).style({
        left: function(d, i, pI) {
            return i * that.config.width / data[pI].values.length + "px";
        },
        top: height + "px",
        width: function(d, i, pI) {
            return that.config.width / data[pI].values.length + "px";
        },
        height: 0 + "px",
        position: "absolute"
    }).on("mousemove", function(d, i, pI) {
        d3.select(this).classed("hover", true);
        var mouse = d3.mouse(container.node());
        that.tooltip.show.call(that, {
            name: data[pI].name,
            values: [ d ]
        }, {
            pos: mouse
        });
        that.events.hover.call(that, d, {
            pos: mouse
        });
    }).on("mouseout", function(d, i) {
        d3.select(this).classed("hover", false);
        var mouse = d3.mouse(container.node());
        that.tooltip.hide.call(that);
        that.events.hoverout.call(that, d, {
            pos: mouse
        });
    });
    bars.transition().duration(this.config.transitionDuration).style({
        left: function(d, i, pI) {
            return i * that.config.width / data[pI].values.length + "px";
        },
        top: function(d, i, pI) {
            return height - d * height / d3.max(data[pI].values) + "px";
        },
        width: function(d, i, pI) {
            return that.config.width / data[pI].values.length - 2 + "px";
        },
        height: function(d, i, pI) {
            return d / d3.max(data[pI].values) * height - 2 + "px";
        }
    });
    bars.exit().remove();
    var labels = charts.selectAll("div.label").data(function(d) {
        return d.values;
    });
    labels.enter().append("div").attr({
        "class": "label"
    }).style({
        left: function(d, i, pI) {
            return i * that.config.width / data[pI].values.length + "px";
        },
        top: function(d, i, pI) {
            var fontSize = parseInt(window.getComputedStyle(this).fontSize, 10);
            return height - fontSize + "px";
        },
        position: "absolute",
        "pointer-events": "none"
    });
    labels.html(function(d, i, pI) {
        return that.config.labelFormatter(data[pI], i);
    }).transition().duration(this.config.transitionDuration).style({
        left: function(d, i, pI) {
            var barW = that.config.width / data[pI].values.length;
            return i * barW + barW / 10 + "px";
        },
        top: function(d, i, pI) {
            var fontSize = parseInt(window.getComputedStyle(this).fontSize, 10);
            return height - fontSize * 1.4 + "px";
        }
    });
    labels.exit().remove();
    return this;
};

moby.renderBubble = function(data) {
    var that = this;
    var keywordsEntries = data.map(function(d, i) {
        return {
            key: d.name,
            value: d.values[0],
            data: d
        };
    });
    var sortKey = that.config.sortByKey;
    var pack = d3.layout.pack().sort(function(a, b) {
        if (sortKey) {
            return d3.ascending(b.data[sortKey], a.data[sortKey]);
        }
        return d3.ascending(b.value, a.value);
    }).size([ this.config.width, this.config.height ]).padding(2).value(function(d) {
        return d.value;
    });
    var colors = this.config.colors || moby.utils.colorPicker();
    var container = d3.select(this.config.containerSelector);
    var charts = container.selectAll("div.chart").data([ 0 ]);
    charts.enter().append("div").attr({
        "class": "bubble chart"
    });
    charts.style({
        width: this.config.width + "px",
        height: this.config.height + "px"
    });
    var translate = function(d) {
        return "translate(" + (d.x - d.r) + "px," + (d.y - d.r) + "px)";
    };
    var bubbleTween = function tween(d, i, a) {
        return d3.interpolateString(this.style.webkitTransform, translate(d));
    };
    var nodes = charts.selectAll(".node").data(pack.nodes({
        key: "a",
        value: 1,
        children: keywordsEntries
    }), function(d) {
        return d.key;
    });
    nodes.enter().append("div").attr({
        "class": "node"
    }).style({
        "-webkit-transform": translate,
        transform: translate,
        width: 0 + "px",
        height: 0 + "px",
        "border-radius": function(d) {
            return d.r + "px";
        },
        position: "absolute",
        "text-align": "center"
    }).on("mousemove", function(d, i) {
        d3.select(this).classed("hover", true);
        var mouse = d3.mouse(container.node());
        that.tooltip.show.call(that, {
            name: d.key,
            values: [ d.value ]
        }, {
            pos: mouse
        });
        that.events.hover.call(that, d, {
            pos: mouse
        });
    }).on("mouseout", function(d, i) {
        d3.select(this).classed("hover", false);
        var mouse = d3.mouse(container.node());
        that.tooltip.hide.call(that);
        that.events.hoverout.call(that, d, {
            pos: mouse
        });
    }).on("click", function(d, i) {
        d3.select(this).classed("hover", false);
        that.tooltip.hide.call(that);
        var mouse = d3.mouse(container.node());
        that.events.click.call(that, d, {
            pos: mouse
        });
    }).append("span").attr({
        "class": "label-container"
    }).style({
        "font-size": 10 + "px",
        "pointer-events": "none",
        position: "absolute",
        left: 0
    });
    nodes.selectAll(".label-container").html("");
    nodes.transition().duration(this.config.transitionDuration).styleTween("-webkit-transform", bubbleTween).styleTween("transform", bubbleTween).style({
        width: function(d) {
            return d.r * 2 + "px";
        },
        height: function(d) {
            return d.r * 2 + "px";
        },
        "border-radius": function(d) {
            return d.r + "px";
        },
        "background-color": function(d, i, pI) {
            var key = that.config.colorByKey;
            if (key && data[i - 1]) {
                return colors(data[i - 1][key]);
            } else {
                return null;
            }
        }
    }).each("end", function(d) {
        var text = that.config.labelFormatter({
            name: d.key,
            values: [ d.value ]
        });
        d3.select(this).select(".label-container").html("").filter(function() {
            return d.r > that.config.labelRadiusThreshold;
        }).html(text).style({
            "font-size": function() {
                var fontSize = parseInt(this.style.fontSize, 10);
                return ~~(fontSize * (d.r * 2) / this.offsetWidth) * .9 + "px";
            },
            "margin-top": function() {
                return d.r - this.offsetHeight / 2 + "px";
            },
            "margin-left": function() {
                return d.r * .1 + "px";
            }
        });
    });
    nodes.exit().remove();
    d3.select(nodes[0][0]).classed("top", true).text("");
    return this;
};