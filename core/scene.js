var utils = require("../utils/main.js");
var core = require("../core/main.js");

var Scene = function(context, options) {
    var i;
    options = options || {};

    this.context = context;

    this.far = 1000;
    this.debug = utils.expandDefault(options.debug, false);
    this.bkColor = utils.colorToArray(utils.expandDefault(options.bkColor, '#AA2222'));
    this.transparentSteps = utils.expandDefault(options.transparentSteps, 2);
    this.distance = utils.expandDefault(options.distance, 600);
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.projection = utils.expandDefault(options.projection, 'perspective');

    this.outdated = true;
    this.objects = [];

    this.cameraAspect = vec2.create();
    vec2.set(this.cameraAspect, 2 / this.context.canvas.width, 2 / this.context.canvas.height);

    this.proj = mat4.create();
    this.view = mat4.create();
    this.cameraPosition = vec3.create();
    this.viewEye = vec3.create();
    this.viewUp = vec3.create();
    this.cameraRotation = quat.create();

    if (this.projection == 'perspective') {
        mat4.perspective(this.proj, 45 * core.Context.DEG2RAD, this.width / this.height, 0.0, this.far);
    } else {
        this.setCameraZoom(utils.expandDefault(options.zoom, 1.0));
    }
    this.setCameraRotation(this.cameraRotation);

    this.cameraBehavior = null;

    this.mvp = mat4.create();
    this.temp = mat4.create();

    this.opaqueLayer = new core.RenderingLayer(this.context, true);
    this.idLayer = new core.RenderingLayer(this.context, false);
    this.transparentLayers = new Array(this.transparentLayers);
    for (i = 0; i < this.transparentSteps; ++i) {
        this.transparentLayers[i] = new core.RenderingLayer(this.context, true);
    }

    this.onUpdate = this.context.onUpdate;
    this.context.onDraw.add(this.drawHandler.bind(this));

    this.onMouseDown = this.context.onMouseDown;
    this.onMouseMove = this.context.onMouseMove;
    this.onMouseUp = this.context.onMouseUp;
    this.onMouseWheel = this.context.onMouseWheel;

    this.context.captureMouse(true);
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
    this.__updateCamera();
}

Scene.prototype.getCameraPosition = function(position) {
    vec3.copy(position, this.cameraPosition);
}

Scene.prototype.setCameraPosition = function(position) {
    vec3.copy(this.cameraPosition, position);
    this.__updateCamera();
}

Scene.prototype.getCameraZoom = function() {
    return this.zoom;
}

Scene.prototype.setCameraZoom = function(zoom) {
    var koef;
    
    this.zoom = zoom;
    koef = this.zoom / 2.0;
    
    mat4.ortho(this.proj, -this.width * koef, this.width * koef, -this.height * koef, this.height * koef, 0.0, this.far);
    this.__updateCamera();
}

Scene.prototype.__updateCamera = function() {
    vec3.set(this.viewEye, 0, 0, -this.distance);
    vec3.transformQuat(this.viewEye, this.viewEye, this.cameraRotation);
    vec3.add(this.viewEye, this.viewEye, this.cameraPosition);
    
    vec3.set(this.viewUp, 0, 1, 0);
    vec3.transformQuat(this.viewUp, this.viewUp, this.cameraRotation);

    mat4.lookAt(this.view, this.viewEye, this.cameraPosition, this.viewUp);
    this.invalidate();
}

Scene.prototype.getTrackballPosition = function(out, posX, posY) {
    var length;

    vec3.set(
        out,
        2 * posX - 1,
        1 - 2 * posY,
        0.0);
    length = out[0] * out[0] + out[1] * out[1];

    if (length > 1.0) {
        vec3.normalize(out, out);
    } else {
        out[2] = Math.sqrt(1.0 - length);
    }
}

Scene.prototype.draw = function() {
    this.context.onDraw.fire();
}

Scene.prototype.invalidate = function() {
    this.outdated = true;
}

Scene.prototype.drawHandler = function() {
    var gl = this.context.gl,
        i = 0,
        transparentStep = 0,
        transparentStepMode;

    if (!this.outdated) {
        return;
    }
    this.outdated = false;

    mat4.multiply(this.mvp, this.proj, this.view);
    for (i = 0; i<this.objects.length; ++i) {
        this.objects[i].transform(this.mvp);
    }

    // Opaque and Id Layer Rendering
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.clearDepth(1.0);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    this.idLayer.fbo.bind(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (i = 0; i<this.objects.length; ++i) {
        this.objects[i].draw(core.Context.LAYER_ID);
    }
    this.idLayer.fbo.unbind();

    this.opaqueLayer.fbo.bind(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (i = 0; i<this.objects.length; ++i) {
        this.objects[i].draw(core.Context.LAYER_OPAQUE);
    }
    this.opaqueLayer.fbo.unbind();

    // Transparent Layers Rendering    
    for (transparentStep = 0; transparentStep < this.transparentSteps; ++transparentStep) {        
        this.transparentLayers[transparentStep].fbo.bind(true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        this.opaqueLayer.depth.bind(0);
        if (transparentStep == 0) {
            transparentStepMode = core.Context.LAYER_TRANSPARENT;
        } else {
            this.transparentLayers[transparentStep - 1].depth.bind(1);
            transparentStepMode = core.Context.LAYER_TRANSPARENT_SUPPLEMENTAL;
        }

        for (var i=0; i<this.objects.length; ++i) {
            this.objects[i].draw(transparentStepMode);
        }
        this.transparentLayers[transparentStep].fbo.unbind();
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(this.bkColor[0], this.bkColor[1], this.bkColor[2], this.bkColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.context.drawTexture(this.opaqueLayer.color,
                             0, 0,
                             gl.canvas.width, gl.canvas.height);
    
    for (transparentStep = this.transparentSteps - 1; transparentStep >= 0; --transparentStep) {
        this.context.drawTexture(this.transparentLayers[transparentStep].color,
                                 0, 0,
                                 this.context.canvas.width, this.context.canvas.height);
    }

    if (this.debug) {
        this.drawDebugInformation();
    }
}

Scene.prototype.drawDebugInformation = function() {
    this.context.drawTexture(this.opaqueLayer.color,
                             0, 0,
                             this.context.canvas.width * 0.2, this.context.canvas.height * 0.2);
    this.context.drawTexture(this.opaqueLayer.depth,
                             0, this.context.canvas.height * 0.8,
                             this.context.canvas.width * 0.2, this.context.canvas.height * 0.2);

    this.context.drawTexture(this.idLayer.color,
                             this.context.canvas.width * 0.8, 0,
                             this.context.canvas.width * 0.2, this.context.canvas.height * 0.2);
    this.context.drawTexture(this.idLayer.depth,
                             this.context.canvas.width * 0.8, this.context.canvas.height * 0.8,
                             this.context.canvas.width * 0.2, this.context.canvas.height * 0.2);

    for (transparentStep = 0; transparentStep < this.transparentSteps; ++transparentStep) {
        this.context.drawTexture(this.transparentLayers[transparentStep].color,
                                 this.context.canvas.width * 0.2 * (transparentStep + 1), 0,
                                 this.context.canvas.width * 0.2, this.context.canvas.height * 0.2);
        this.context.drawTexture(this.transparentLayers[transparentStep].depth,
                                 this.context.canvas.width * 0.2 * (transparentStep + 1), this.context.canvas.height * 0.8,
                                 this.context.canvas.width * 0.2, this.context.canvas.height * 0.2);
    }
}

module.exports = Scene;
