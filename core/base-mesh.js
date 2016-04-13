var BaseMesh = function() {
    this.scene = null;
    this.mvp = mat4.create();
}

BaseMesh.prototype.transform = function(mvp) {
    mat4.copy(this.mvp, mvp);
}

BaseMesh.prototype.setScene = function(scene) {
    this.scene = scene;
    this.scene.addObject(this);

    return this;
}

module.exports = BaseMesh;
