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

var OrbitalMouse = function() {
    this.camera = quat.create();
    this.delta = quat.create();
    this.current = vec3.create();
    this.prev = vec3.create();
    this.scene = null;
    
    this.mouseMoveEvent = 0;
    this.mouseDownEvent = 0;
    this.mouseUpEvent = 0;
}

OrbitalMouse.prototype.attach = function(scene) {
    this.scene = scene;
    this.scene.getCameraRotation(this.camera);
    
    this.mouseDownEvent = this.scene.onMouseDown.add(this.mouseDownHandler.bind(this));
    this.mouseUpEvent = this.scene.onMouseUp.add(this.mouseUpHandler.bind(this));
}

OrbitalMouse.prototype.detach = function(scene) {
    this.scene.onMouseDown.remove(this.mouseDownEvent);
    this.scene.onMouseUp.remove(this.mouseUpEvent);
    this.scene.onMouseMove.remove(this.mouseMoveEvent);

    this.mouseUpEvent = 0;
    this.mouseDownEvent = 0;
    this.mouseMoveEvent = 0;
}

OrbitalMouse.prototype.mouseMoveHandler = function(e) {
    this.scene.getTrackballPosition(this.current, e.canvasX, e.canvasY);
    quat.rotationTo(this.delta, this.current, this.prev);
    quat.multiply(this.camera, this.camera, this.delta);
    this.scene.setCameraRotation(this.camera);
    this.scene.draw();
    vec3.copy(this.prev, this.current);
}

OrbitalMouse.prototype.mouseDownHandler = function(e) {
    this.mouseMoveEvent = this.scene.onMouseMove.add(this.mouseMoveHandler.bind(this));
    this.scene.getTrackballPosition(this.current, e.canvasX, e.canvasY);
    vec3.copy(this.prev, this.current);
}

OrbitalMouse.prototype.mouseUpHandler = function(e) {
    this.scene.onMouseMove.remove(this.mouseMoveEvent);
    this.mouseMoveEvent = 0;
}

module.exports.AutoRotating = AutoRotating;
module.exports.OrbitalMouse = OrbitalMouse;
