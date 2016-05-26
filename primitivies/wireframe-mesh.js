var core = require("../core/main.js");
var utils = require("../utils/main.js");
var primitivies = require("../primitivies/main.js");

var WireframeMesh = function(options) {
    this.constructor.prototype.constructor.call(this, options);
}

WireframeMesh.prototype = Object.create(core.BaseMesh.prototype);

WireframeMesh.prototype.initialize = function() {
    var i,
        temp;

    this.pointTransformed = [];
    this.front = [];
    this.linesPrimitivies = [];

    for (i = 0; i<this.points.length; ++i) {
        this.pointTransformed.push(vec3.create());
    }

    for (i = 0; i<this.lines.length; ++i) {
        this.front.push(true);
        
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

WireframeMesh.prototype.setOptions = function(options, initial) {
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

WireframeMesh.prototype.transform = function(mat)
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

WireframeMesh.prototype.setScene = function(scene) {
    var i;
    
    this.constructor.prototype.setScene.call(this, scene);

    for (i = 0; i < this.linesPrimitivies.length; i++) {
        this.linesPrimitivies[i].setScene(scene);
    }
    
    return this;
}

module.exports = WireframeMesh;
