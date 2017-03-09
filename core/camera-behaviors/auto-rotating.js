var AutoRotating = function(x, y, z, angle) {
    var axis = vec3.fromValues(x, y, z);

    this.camera = quat.create();
    this.delta = quat.create();
    this.rotation = quat.create();
    this.scene = null;
    
    this.updateEvent = 0;

    quat.setAxisAngle(this.rotation, axis, angle);
}

AutoRotating.prototype.attach = function(scene) {
    this.scene = scene;
    this.scene.getCameraRotation(this.camera);
    
    this.updateEvent = this.scene.onUpdate.add(this.updateHandler.bind(this));

    this.scene.context.animate(true);
}

AutoRotating.prototype.detach = function(scene) {
    this.scene.context.animate(false);
    
    this.scene.onUpdate.remove(this.updateEvent);

    this.updateEvent = 0;
}

AutoRotating.prototype.updateHandler = function(dt) {
    quat.scale(this.delta, this.rotation, dt);
    quat.calculateW(this.delta, this.delta);
    quat.multiply(this.camera, this.camera, this.delta);
    this.scene.setCameraRotation(this.camera);
}

module.exports = AutoRotating;
