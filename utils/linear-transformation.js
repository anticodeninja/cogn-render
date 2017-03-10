var LinearTransformation = function(sourceMin, sourceMax, targetMin, targetMax) {
    this.sourceMin = sourceMin;
    this.sourceLength = sourceMax - sourceMin;
    this.sourceMax = sourceMax;
    this.targetMin = targetMin;
    this.targetLength = targetMax - targetMin;
    this.targetMax = targetMax;
}

LinearTransformation.prototype.toPoint = function(value) {
    return this.targetMin + this.targetLength * (value - this.sourceMin) / this.sourceLength;
}

module.exports = LinearTransformation;
