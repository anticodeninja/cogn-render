var BaseMesh = function(options) {
    this.scene = null;
    this.mvp = mat4.create();

    this.setOptions(options || {}, true);
}

BaseMesh.prototype.setOptions = function(options) {
    return this;
}

BaseMesh.prototype.transform = function(mvp) {
    mat4.copy(this.mvp, mvp);

    return this;
}

BaseMesh.prototype.setScene = function(scene) {
    this.scene = scene;
    this.scene.addObject(this);

    return this;
}

BaseMesh.prototype.upload = function() {
    return this;
}

BaseMesh.prototype.draw = function() {
    return this;
}

module.exports = BaseMesh;
