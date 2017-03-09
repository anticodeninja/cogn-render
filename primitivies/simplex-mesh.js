var primitivies = require("../primitivies/main.js");

var SimplexMesh = function(trans, options) {
    this.constructor.prototype.constructor.call(this, options);

    if (!options.flatRender) {
        this.points = [
            trans.toPoint([1, 0, 0, 0]),
            trans.toPoint([0, 1, 0, 0]),
            trans.toPoint([0, 0, 1, 0]),
            trans.toPoint([0, 0, 0, 1])
        ];

        this.lines = [
            [0, 1],
            [0, 2],
            [0, 3],
            [1, 2],
            [2, 3],
            [3, 1]
        ];

        this.edgePoints = [
            [0, 1, 2],
            [0, 2, 3],
            [0, 3, 1],
            [1, 3, 2]
        ];

        this.edgeLines = [
            [0, 3, 1],
            [1, 4, 2],
            [2, 5, 0],
            [3, 4, 5]
        ];
    } else {
        this.points = [
            options.flatRender.to3D(trans.toPoint([1, 0, 0])),
            options.flatRender.to3D(trans.toPoint([0, 1, 0])),
            options.flatRender.to3D(trans.toPoint([0, 0, 1]))
        ];

        this.lines = [
            [0, 1],
            [1, 2],
            [2, 0]
        ];

        this.edgePoints = [
            [0, 2, 1]
        ];

        this.edgeLines = [
            [0, 1, 2]
        ];
    }
    
    this.initialize();
}

SimplexMesh.prototype = Object.create(primitivies.WireframeMesh.prototype);

module.exports = SimplexMesh;
