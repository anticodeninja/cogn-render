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
    this.scene.getTrackballPosition(this.current, e.realX, e.realY);
    quat.rotationTo(this.delta, this.current, this.prev);
    vec3.copy(this.prev, this.current);
    
    this.scene.getCameraRotation(this.camera);
    quat.multiply(this.camera, this.camera, this.delta);
    this.scene.setCameraRotation(this.camera);
    
    this.scene.draw();
}

OrbitalMouse.prototype.mouseDownHandler = function(e) {
    if (this.mouseMoveEvent !== 0) {
        return;
    }

    this.mouseMoveEvent = this.scene.onMouseMove.add(this.mouseMoveHandler.bind(this));
    this.scene.getTrackballPosition(this.current, e.realX, e.realY);
    vec3.copy(this.prev, this.current);
}

OrbitalMouse.prototype.mouseUpHandler = function(e) {
    this.scene.onMouseMove.remove(this.mouseMoveEvent);
    this.mouseMoveEvent = 0;
}

module.exports = OrbitalMouse;
