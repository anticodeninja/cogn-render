Scene = function(gl, options) {
    var i;
    options = options || {};
    
    this.gl = gl;

    this.far = 1000;
    this.bkColor = colorToArray(options.bkColor || '#AA2222');
    this.transparentSteps = options.transparentSteps || 2;
    
    this.outdated = true;
    this.objects = [];

    this.cameraAspect = vec2.create();
    vec2.set(this.cameraAspect, 2 / gl.canvas.width, 2 / gl.canvas.height);

    this.proj = mat4.create();
    mat4.perspective(this.proj, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0.0, this.far);
    
    this.view = mat4.create();
    mat4.identity(this.view);
    
    this.mvp = mat4.create();
    this.temp = mat4.create();

    this.opaqueLayer = new RenderingLayer(gl, true);
    this.idLayer = new RenderingLayer(gl, false);
    this.transparentLayers = new Array(this.transparentLayers);
    for (i = 0; i<this.transparentSteps; ++i) {
        this.transparentLayers[i] = new RenderingLayer(gl, true);
    }

    this.gl.ondraw = this.draw.bind(this);
}

Scene.prototype.getObjectId = function(posX, posY) {
    var color = new Uint8Array(4);
    
    this.idLayer.fbo.bind(true);
    this.gl.readPixels(posX, posY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
    this.idLayer.fbo.unbind();

    return colorToId(color);
}

Scene.prototype.addObject = function(obj) {
    this.objects.push(obj);
    obj.upload();
}

Scene.prototype.setCamera = function(pos, dir, up) {
    mat4.lookAt(this.view, pos, dir, up);
}

Scene.prototype.invalidate = function() {
    this.outdated = true;
}

Scene.prototype.draw = function() {
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
    
    this.opaqueLayer.fbo.bind(true);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (i = 0; i<this.objects.length; ++i) {
        this.objects[i].draw(1);
    }
    this.opaqueLayer.fbo.unbind();

    this.idLayer.fbo.bind(true);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i=0; i<this.objects.length; ++i) {
        this.objects[i].draw(3);
    }
    this.idLayer.fbo.unbind();

    // Transparent Layers Rendering
    this.gl.enable(gl.DEPTH_TEST);
    this.gl.depthFunc(gl.GEQUAL);
    this.gl.disable(gl.BLEND);
    this.gl.clearDepth(0.0);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
    for (transparentStep = 0; transparentStep < this.transparentSteps; ++transparentStep) {
        this.transparentLayers[transparentStep].fbo.bind(true);
        this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        if (transparentStep == 0) {
            this.opaqueLayer.depth.bind(0);
        } else {
            this.transparentLayers[transparentStep - 1].depth.bind(0);
        }
        
        for (var i=0; i<this.objects.length; ++i) {
            this.objects[i].draw(2);
        }
        
        this.transparentLayers[transparentStep].fbo.unbind();
    }

    var quad = GL.Mesh.getScreenQuad();

    this.gl.disable(gl.DEPTH_TEST);
    this.gl.enable(gl.BLEND);
    this.gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(this.bkColor[0], this.bkColor[1], this.bkColor[2], this.bkColor[3]);
    this.gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawTexture(this.opaqueLayer.color,
                   0, 0,
                   gl.canvas.width, gl.canvas.height);
    for (transparentStep = 0; transparentStep < this.transparentSteps; ++transparentStep) {
        gl.drawTexture(this.transparentLayers[transparentStep].color,
                       0, 0,
                       gl.canvas.width, gl.canvas.height);
    }

    gl.drawTexture(this.opaqueLayer.color,
                   0, 0,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.opaqueLayer.depth,
                   0, gl.canvas.height * 0.8,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.transparentLayers[0].color,
                   gl.canvas.width * 0.2, 0,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.transparentLayers[0].depth,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.8,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.transparentLayers[1].color,
                   gl.canvas.width * 0.4, 0,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.transparentLayers[1].depth,
                   gl.canvas.width * 0.4, gl.canvas.height * 0.8,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.idLayer.color,
                   gl.canvas.width * 0.8, 0,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
    gl.drawTexture(this.idLayer.depth,
                   gl.canvas.width * 0.8, gl.canvas.height * 0.8,
                   gl.canvas.width * 0.2, gl.canvas.height * 0.2);
}
