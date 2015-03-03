all:
	uglifyjs ./src/core.js ./src/utils.js ./src/line.js ./src/bar.js ./src/bar2D.js -b -o moby-0.1.0.js
	uglifyjs ./src/core.js ./src/utils.js ./src/line.js ./src/bar.js ./src/bar2D.js -o moby-0.1.0.min.js -c -m