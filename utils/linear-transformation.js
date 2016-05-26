var LinearTransformation = function(size, minValue, maxValue) {
    this.size = size;
    this.minValue = minValue;
    this.maxValue = maxValue;
}

LinearTransformation.prototype.toPoint = function(value) {
    return this.size * (value - this.minValue) / (this.maxValue - this.minValue);
}

module.exports = LinearTransformation;
