var utils = require("../utils/main.js");
var core = require("../core/main.js");

var Scene = function(gl, options) {
    var i;
    options = options || {};

    this.gl = gl;

    this.far = 1000;
    this.debug = utils.expandDefault(options.debug, false);
    this.bkColor = utils.colorToArray(utils.expandDefault(options.bkColor, '#AA2222'));
    this.transparentSteps = utils.expandDefault(options.transparentSteps, 2);
    this.distance = utils.expandDefault(options.distance, 600);
    this.width = this.gl.canvas.width;
    this.height = gl.canvas.height;

    this.outdated = true;
    this.objects = [];

    this.cameraAspect = vec2.create();
    vec2.set(this.cameraAspect, 2 / gl.canvas.width, 2 / gl.canvas.height);

    this.proj = mat4.create();
    mat4.perspective(this.proj, 45 * DEG2RAD,  this.width / this.height, 0.0, this.far);

    this.view = mat4.create();
    this.viewCenter = vec3.create();
    this.viewEye = vec3.create();
    this.viewUp = vec3.create();
    this.cameraRotation = quat.create();
    this.setCameraRotation(this.cameraRotation);

    this.cameraBehavior = null;

    this.mvp = mat4.create();
    this.temp = mat4.create();

    this.opaqueLayer = new core.RenderingLayer(gl, true);
    this.idLayer = new core.RenderingLayer(gl, false);
    this.transparentLayers = new Array(this.transparentLayers);
    for (i = 0; i<this.transparentSteps; ++i) {
        this.transparentLayers[i] = new core.RenderingLayer(gl, true);
    }

    this.onUpdate = new core.Event();
    this.onMouseDown = new core.Event();
    this.onMouseMove = new core.Event();
    this.onMouseUp = new core.Event();

    this.gl.ondraw = this.drawHandler.bind(this);
    this.gl.onupdate = this.updateHandler.bind(this);
    this.gl.onmousedown = this.mouseDownHandler.bind(this);
    this.gl.onmousemove = this.mouseMoveHandler.bind(this);
    this.gl.onmouseup = this.mouseUpHandler.bind(this);

    this.gl.captureMouse();
}

Scene.prototype.getObjectId = function(posX, posY) {
    var color = new Uint8Array(4);

    this.idLayer.fbo.bind(true);
    this.gl.readPixels(posX, posY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
    this.idLayer.fbo.unbind();

    return utils.colorToId(color);
}

Scene.prototype.addObject = function(obj) {
    this.objects.push(obj);
    obj.upload();
}

Scene.prototype.setCameraBehavior = function(behavior) {
    if (this.cameraBehavior !== null) {
        this.cameraBehavior.detach(this);
    }

    this.cameraBehavior = behavior;

    if (this.cameraBehavior !== null) {
        this.cameraBehavior.attach(this);
    }
}

Scene.prototype.getCameraRotation = function(rotation) {
    quat.copy(rotation, this.cameraRotation);
}

Scene.prototype.setCameraRotation = function(rotation) {
    quat.copy(this.cameraRotation, rotation);
    vec3.set(this.viewEye, 0, 0, -this.distance);
    vec3.set(this.viewUp, 0, 1, 0);
    vec3.transformQuat(this.viewEye, this.viewEye, rotation);
    vec3.transformQuat(this.viewUp, this.viewUp, rotation);
    mat4.lookAt(this.view, this.viewEye, this.viewCenter, this.viewUp);
    this.invalidate();
}

Scene.prototype.getTrackballPosition = function(out, posX, posY) {
    var length;

    vec3.set(
        out,
        (posX - 0.5 * this.width) / (0.5 * this.width),
        (0.5 * this.height - posY) / (0.5 * this.height),
        0.0);
    length = out[0] * out[0] + out[1] * out[1];

    if (length > 1.0) {
        vec3.normalize(out, out);
    } else {
        out[2] = Math.sqrt(1.0 - length);
    }
}

Scene.prototype.draw = function() {
    this.gl.ondraw();
}

Scene.prototype.invalidate = function() {
    this.outdated = true;
}

Scene.prototype.drawHandler = function() {
    var i = 0,
        transparentStep = 0;

    if (!this.outdated) {
        return;
    }
    this.outdated = false;

    mat4.multiply(this.mvp, this.proj, this.view);
    for (i = 0; i<this.objects.length; ++i) {
        this.objects[i].transform(this.mvp);
    }

    // Opaque and Id Layer Rendering
    this.gl.enable(gl.DEPTH_TEST);
    this.gl.depthFunc(gl.LEQUAL);
    this.gl.disable(gl.BLEND);
    this.gl.clearDepth(1.0);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    this.idLayer.fbo.bind(true);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i=0; i<this.objects.length; ++i) {
        this.objects[i].draw(0);
    }
    this.idLayer.fbo.unbind();

    this.opaqueLayer.fbo.bind(true);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (i = 0; i<this.objects.length; ++i) {
        this.objects[i].draw(1);
    }
    this.opaqueLayer.fbo.unbind();

    // Transparent Layers Rendering
    for (transparentStep = 0; transparentStep < this.transparentSteps; ++transparentStep) {
        this.transparentLayers[transparentStep].fbo.bind(true);
        this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.opaqueLayer.depth.bind(0);
        if (transparentStep > 0) {
            this.transparentLayers[transparentStep - 1].depth.bind(1);
        }

        for (var i=0; i<this.objects.length; ++i) {
            this.objects[i].draw(2 + transparentStep);
        }

        this.transparentLayers[transparentStep].fbo.unbind();
    }

    this.gl.disable(gl.DEPTH_TEST);
    this.gl.enable(gl.BLEND);
    this.gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(this.bkColor[0], this.bkColor[1], this.bkColor[2], this.bkColor[3]);
    this.gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawTexture(this.opaqueLayer.color,
                   0, 0,
                   gl.canvas.width, gl.canvas.height);
    
    for (transparentStep = this.transparentSteps - 1; transparentStep >= 0; --transparentStep) {
        gl.drawTexture(this.transparentLayers[transparentStep].color,
                       0, 0,
                       gl.canvas.width, gl.canvas.height);
    }

    if (this.debug) {
        this.drawDebugInformation();
    }
}

Scene.prototype.drawDebugInformation = function() {
    gl.drawTexture(this.opaqueLayer.color,
                   0, 0,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.opaqueLayer.depth,
                   0, gl.canvas.height * 0.8,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);

    gl.drawTexture(this.idLayer.color,
                   gl.canvas.width * 0.8, 0,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.idLayer.depth,
                   gl.canvas.width * 0.8, gl.canvas.height * 0.8,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);

    for (transparentStep = 0; transparentStep < this.transparentSteps; ++transparentStep) {
        gl.drawTexture(this.transparentLayers[transparentStep].color,
                       gl.canvas.width * 0.2 * (1 + transparentStep), 0,
                       gl.canvas.width * 0.2, gl.canvas.height * 0.2);
        gl.drawTexture(this.transparentLayers[transparentStep].depth,
                       gl.canvas.width * 0.2 * (1 + transparentStep), gl.canvas.height * 0.8,
                       gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    }
}

Scene.prototype.updateHandler = function(dt) {
    this.onUpdate.fire(dt);
}

Scene.prototype.mouseDownHandler = function(e) {
    this.onMouseDown.fire(e);
}

Scene.prototype.mouseMoveHandler = function(e) {
    this.onMouseMove.fire(e);
}

Scene.prototype.mouseUpHandler = function(e) {
    this.onMouseUp.fire(e);
}

module.exports = Scene;
