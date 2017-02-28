var SimplexTransformation = function(size) {
    this.size = size;
}

var pLength = {
    3: Math.sqrt(3) / 2,
    4: Math.sqrt(2 / 3)
}

var pAngles = {
    3: [
        Math.PI / 3,
        0
    ],
    4: [
        [Math.PI / 3, -Math.asin(1 / 3)],
        [Math.PI / 3, -Math.PI / 2],
        [0, 0]
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
	    Math.cos(pAngles[3][i]) / pLength[3],
	    Math.sin(pAngles[3][i]) / pLength[3]
	]);
    }
    for (i = 0; i < 3; ++i) {
	mKoef[3].push([
	    Math.cos(mAngles[3][i]) / pLength[3],
	    Math.sin(mAngles[3][i]) / pLength[3]
	]);
    }

    // precalc 3-simplex
    for (i = 0; i < 3; ++i) {
	pKoef[4].push([
            Math.cos(pAngles[4][i][0]) / pLength[4],
	    Math.sin(pAngles[4][i][0]) * Math.cos(pAngles[4][i][1]) / pLength[4],
	    Math.sin(pAngles[4][i][0]) * Math.sin(pAngles[4][i][1]) / pLength[4]
	]);
    }
    for (i = 0; i < 4; ++i) {
	mKoef[4].push([
            Math.cos(mAngles[4][i][0]) / pLength[4],
	    Math.sin(mAngles[4][i][0]) * Math.cos(mAngles[4][i][1]) / pLength[4],
	    Math.sin(mAngles[4][i][0]) * Math.sin(mAngles[4][i][1]) / pLength[4]
	]);
    }
})();

SimplexTransformation.prototype.toPoint = function(h, path) {
    var i, j,
        h = this.normalize(h),
        koef = pKoef[h.length],
        coord = new Float32Array(h.length - 1),
        chunk;

    // centerize start point
    for (i = 0; i < h.length - 1; ++i) {
        for (j = 0; j < h.length - 1; ++j) {
            coord[j] += (-this.size / h.length) * koef[i][j] ;
        }
    }

    // move to necessary
    for (i = 0; i < h.length - 1; ++i) {
        for (j = 0; j < h.length - 1; ++j) {
            coord[j] += h[i] * koef[i][j];
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
