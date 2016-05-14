var core = require("../core/main.js");
var utils = require("../utils/main.js");
var primitivies = require("../primitivies/main.js");

var SimplexMesh = function(height, options) {
    var i,
        temp,
        simTrans = new utils.SimplexTransformation(height);

    this.constructor.prototype.constructor.call(this, options);

    this.points = [
        simTrans.toPoint([1, 0, 0, 0]),
        simTrans.toPoint([0, 1, 0, 0]),
        simTrans.toPoint([0, 0, 1, 0]),
        simTrans.toPoint([0, 0, 0, 1]),
    ];
    this.pointTransformed = [
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create()
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
    this.front = [
        true, true, true, false, false, false
    ]

    this.linesPrimitivies = [];
    for (i = 0; i < 6; ++i) {
        temp = new primitivies.LineMesh({
            "color": this.color,
            "thickness": this.thickness,
            "pattern": this.pattern,
            "antialias": this.antialias
        });
        temp.addPoint(this.points[this.lines[i][0]]);
        temp.addPoint(this.points[this.lines[i][1]]);
        
        this.linesPrimitivies.push(temp);
    }
}

SimplexMesh.prototype = Object.create(core.BaseMesh.prototype);

SimplexMesh.prototype.setOptions = function(options, initial) {
    if (options.color || initial) {
        this.color = utils.expandDefault(options.color, "#000000");
    }

    if (options.thickness || initial) {
        this.thickness = utils.expandDefault(options.thickness, 3);
    }

    if (options.pattern || initial) {
        this.pattern = utils.expandDefault(options.pattern, [50, 10]);
    }

    if (options.antialias || initial) {
        this.antialias = utils.expandDefault(options.antialias, 2);
    }

    if (this.linesPrimitivies) {
        for (i = 0; i < this.linesPrimitivies.length; ++i) {
            this.linesPrimitivies[i].setOptions({
                "color": this.color,
                "thickness": this.thickness,
                "antialias": this.antialias
            });
        }
    }
}

SimplexMesh.prototype.transform = function(mat)
{
    this.constructor.prototype.transform.call(this, mat);
    
    var i, j,
        first = vec3.create(),
        second = vec3.create(),
        temp = vec3.create();

    for (i = 0; i < this.points.length; ++i) {
        vec3.transformMat4(this.pointTransformed[i], this.points[i], mat);
    }

    for (i = 0; i < this.lines.length; ++i) {
        this.front[i] = false;
    }

    for (i = 0; i < this.edgePoints.length; ++i) {
        vec3.subtract(first,
                      this.pointTransformed[this.edgePoints[i][0]],
                      this.pointTransformed[this.edgePoints[i][1]]);
        vec3.subtract(second,
                      this.pointTransformed[this.edgePoints[i][1]],
                      this.pointTransformed[this.edgePoints[i][2]]);

        vec3.cross(temp, first, second);
        if (temp[2] < 0) {
            for (j = 0; j < this.edgeLines[i].length; ++j) {
                this.front[this.edgeLines[i][j]] = true;
            }
        }
    }

    for (i = 0; i < this.lines.length; ++i) {
        this.linesPrimitivies[i].setOptions({ pattern: this.front[i] ? [0] : this.pattern });
    }

    this.upload();
}

SimplexMesh.prototype.setScene = function(scene) {
    var i;
    
    this.constructor.prototype.setScene.call(this, scene);

    for (i = 0; i < this.linesPrimitivies.length; i++) {
        this.linesPrimitivies[i].setScene(scene);
    }
    
    return this;
}

module.exports = SimplexMesh;
