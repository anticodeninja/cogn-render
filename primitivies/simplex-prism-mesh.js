var primitivies = require("../primitivies/main.js");

var SimplexPrismMesh = function(trans, options) {
    this.constructor.prototype.constructor.call(this, options);

    this.points = [
        trans.toPoint([1, 0, 0, trans.progressTransformation.sourceMin]),
        trans.toPoint([0, 1, 0, trans.progressTransformation.sourceMin]),
        trans.toPoint([0, 0, 1, trans.progressTransformation.sourceMin]),
        trans.toPoint([1, 0, 0, trans.progressTransformation.sourceMax]),
        trans.toPoint([0, 1, 0, trans.progressTransformation.sourceMax]),
        trans.toPoint([0, 0, 1, trans.progressTransformation.sourceMax]),
    ];
    
    this.lines = [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 4],
        [4, 5],
        [5, 3],
        [0, 3],
        [1, 4],
        [2, 5]
    ];
    
    this.edgePoints = [
        [0, 2, 1],
        [3, 4, 5],
        [0, 1, 3],
        [1, 2, 4],
        [2, 0, 5]
    ];
    
    this.edgeLines = [
        [0, 1, 2],
        [3, 4, 5],
        [0, 3, 6, 7],
        [1, 4, 7, 8],
        [2, 5, 8, 6]
    ];

    this.initialize();
}

SimplexPrismMesh.prototype = Object.create(primitivies.WireframeMesh.prototype);

module.exports = SimplexPrismMesh;
