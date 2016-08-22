var SimplexTransformation = function(size) {
    this.size = size;
}

SimplexTransformation.prototype.legKoef = 1 / Math.cos(Math.PI/6);

var pAngles = {
    3: [
        -Math.PI / 3,
        Math.PI
    ],
    4: [
        [Math.PI - Math.acos(Math.sqrt(2/3)), 0],
        [Math.PI / 2,  Math.PI / 6 * 5],
        [Math.PI / 2, -Math.PI / 2]
    ]
}

var mAngles = {
    3: [
        -Math.PI / 2,
        Math.PI / 6 * 5,
        Math.PI / 6
    ],
    4: [
        [Math.PI, 0],
        [Math.atan(Math.SQRT2),  Math.PI],
        [Math.atan(Math.SQRT2), -Math.PI / 3],
        [Math.atan(Math.SQRT2),  Math.PI / 3]
    ]
};

var pKoef = {
    3: [],
    4: []
};

var mKoef = {
    3: [],
    4: []
};

(function() {
    var i;

    // precalc 2-simplex
    for (i = 0; i < 2; ++i) {
	pKoef[3].push([
	    Math.cos(pAngles[3][i]),
	    Math.sin(pAngles[3][i])
	]);
    }
    for (i = 0; i < 3; ++i) {
	mKoef[3].push([
	    Math.cos(mAngles[3][i]),
	    Math.sin(mAngles[3][i])
	]);
    }

    // precalc 3-simplex
    for (i = 0; i < 3; ++i) {
	mKoef[4].push([
	    Math.sin(mAngles[4][i][0]) * Math.cos(mAngles[4][i][1]),
	    Math.cos(mAngles[4][i][0]),
	    Math.sin(mAngles[4][i][0]) * Math.sin(mAngles[4][i][1])
	]);
    }
    for (i = 0; i < 4; ++i) {
	mKoef[4].push([
	    Math.sin(mAngles[4][i][0]) * Math.cos(mAngles[4][i][1]),
	    Math.cos(mAngles[4][i][0]),
	    Math.sin(mAngles[4][i][0]) * Math.sin(mAngles[4][i][1])
	]);
    }
})();

SimplexTransformation.prototype.toPoint = function(h, path) {
    var i, j,
        chunkLength,
        h = this.normalize(h),
        height = this.size,
        koef = pKoef[h.length],
        coord = new Float32Array(h.length - 1),
        chunk;

    coord[1] = this.size / 3 * 2;

    for (i = 0; i < h.length - 1; ++i) {
        height -= h[i];
        chunkLength = height * this.legKoef;

        for (j = 0; j < h.length - 1; ++j) {
            coord[j] += chunkLength * koef[i][j];
        }

        if (path)
        {
            chunk = new Float32Array(h.length - 1);
            for (j = 0; j < h.length - 1; ++j) {
                chunk[j] = coord[j];
            }
            path.push(chunk);
        }
    }

    return coord;
}

SimplexTransformation.prototype.toMedian = function(h) {
    var i,
        path = [],
        h = this.normalize(h),
        koef = mKoef[h.length],
        coord = this.toPoint(h),
        chunk;

    for (i = 0; i < h.length; ++i) {
        chunk = new Float32Array(h.length - 1);
        for (j = 0; j < h.length - 1; ++j) {
            chunk[j] = coord[j] + h[i] * koef[i][j];
        }
        path.push(chunk);
    }

    return path;
}

SimplexTransformation.prototype.normalize = function(h) {
    var i,
        koef = 1,
        sum = 0,
        res = new Float32Array(h.length);

    for (i=0; i<h.length; ++i) {
        sum += h[i];
    }
    koef = this.size / sum;

    for (i=0; i<h.length; ++i) {
        res[i] = h[i] * koef;
    }

    return res;
}

module.exports = SimplexTransformation;
