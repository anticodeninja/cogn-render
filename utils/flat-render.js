var FlatRender = function() {
    this.distance = 0;
}

FlatRender.prototype.to3D = function(point) {
    return point.length == 3
        ? point
        : vec3.fromValues(point[0], point[1], this.distance);
}

module.exports = FlatRender;
