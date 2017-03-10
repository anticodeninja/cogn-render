var utils = require("./main.js");

var SimplexPrismTransformation = function(size, transformation) {
    this.simplexTransformation = new utils.SimplexTransformation(size);
    this.progressTransformation = transformation;
}

SimplexPrismTransformation.prototype.toPoint = function(value) {
    var result = vec3.create();
    var temp = this.simplexTransformation.toPoint(value.slice(0, 3));

    result[0] = temp[0];
    result[1] = temp[1];
    result[2] = this.progressTransformation.toPoint(value[3]);
    
    return result;
}

module.exports = SimplexPrismTransformation;
