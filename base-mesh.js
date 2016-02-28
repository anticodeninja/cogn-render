BaseMesh = function() {
    this.scene = null;
    this.modelMat = mat4.create();
}

BaseMesh.prototype.setScene = function(scene) {
    this.scene = scene;
    this.scene.addObject(this);

    return this;
}
