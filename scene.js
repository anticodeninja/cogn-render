Scene = function(gl, options) {
    options = options || {};
    
    this.gl = gl;
    
    this.bkColor = colorToArray(options.bkColor || '#AA2222');
    
    this.outdated = true;
    this.objects = [];

    this.cameraAspect = vec2.create();
    vec2.set(this.cameraAspect, 2 / gl.canvas.width, 2 / gl.canvas.height);

    this.proj = mat4.create();
    mat4.perspective(this.proj, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0.1, 1000);
    
    this.view = mat4.create();
    mat4.identity(this.view);
    
    this.mvp = mat4.create();
    this.temp = mat4.create();

    this.textureColorOpaque = new GL.Texture(
        gl.canvas.width,
        gl.canvas.height,
        { type: gl.UNSIGNED_BYTE, filter: gl.NEAREST });
    this.textureDepthOpaque = new GL.Texture(
        gl.canvas.width,
        gl.canvas.height,
        { format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_INT, filter: gl.NEAREST });
    this.fboOpaque = new GL.FBO([this.textureColorOpaque], this.textureDepthOpaque);
    
    this.textureColorTransparent = new GL.Texture(
        gl.canvas.width,
        gl.canvas.height,
        { type: gl.UNSIGNED_BYTE, filter: gl.NEAREST });
    this.textureDepthTransparent = new GL.Texture(
        gl.canvas.width,
        gl.canvas.height,
        { format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_INT, filter: gl.NEAREST });
    this.fboTransparent = new GL.FBO([this.textureColorTransparent], this.textureDepthTransparent);
    
    this.textureColorId = new GL.Texture(
        gl.canvas.width,
        gl.canvas.height,
        { type: gl.UNSIGNED_BYTE, filter: gl.NEAREST });
    this.textureDepthId = new GL.Texture(
        gl.canvas.width,
        gl.canvas.height,
        { format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_INT, filter: gl.LINEAR });
    this.fboId = new GL.FBO([this.textureColorId], this.textureDepthId);

    this.mergeShader = Shader.fromURL("merge.vert", "merge.frag");

    this.gl.ondraw = this.draw.bind(this);
}

Scene.prototype.getObjectId = function(posX, posY) {
    var color = new Uint8Array(4);
    
    this.fboId.bind(true);
    this.gl.readPixels(posX, posY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
    this.fboId.unbind();

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
    var i = 0;
    if (!this.outdated) {
        return;
    }

    this.outdated = false;
    
    mat4.multiply(this.mvp, this.proj, this.view);
    for (var i=0; i<this.objects.length; ++i) {
        this.objects[i].transform(this.mvp);
    }
    
    this.fboOpaque.bind(true);
    this.gl.enable(gl.DEPTH_TEST);
    this.gl.depthFunc(gl.LESS);
    this.gl.disable(gl.BLEND);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    for (var i=0; i<this.objects.length; ++i) {
        this.objects[i].draw(1);
    }
    this.fboOpaque.unbind();

    this.fboTransparent.bind(true);
    this.gl.enable(gl.DEPTH_TEST);
    //this.gl.depthFunc(gl.GREATER);
    this.gl.disable(gl.BLEND);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i=0; i<this.objects.length; ++i) {
        this.objects[i].draw(2);
    }
    this.fboTransparent.unbind();

    this.fboId.bind(true);
    this.gl.enable(gl.DEPTH_TEST);
    this.gl.depthFunc(gl.LESS);
    this.gl.disable(gl.BLEND);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i=0; i<this.objects.length; ++i) {
        this.objects[i].draw(3);
    }
    this.fboId.unbind();

    var quad = GL.Mesh.getScreenQuad();

    this.gl.disable(gl.DEPTH_TEST);
    this.gl.enable(gl.BLEND);
    this.gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(this.bkColor[0], this.bkColor[1], this.bkColor[2], this.bkColor[3]);
    this.gl.clear(gl.COLOR_BUFFER_BIT);
    
    this.textureColorOpaque.bind(0);
    this.textureDepthOpaque.bind(1);
    this.textureColorTransparent.bind(2);
    this.textureDepthTransparent.bind(3);

    this.mergeShader.uniforms({
        u_color_texture1: 0,
	u_depth_texture1: 1,
        u_color_texture2: 2,
	u_depth_texture2: 3,
        u_viewport: gl.viewport_data
    }).draw(quad);

    // gl.drawTexture(texture_color1, 0,0, gl.canvas.width * 0.5, gl.canvas.height * 0.5);
    // gl.drawTexture(texture_depth1, gl.canvas.width * 0.5, 0, gl.canvas.width * 0.5, gl.canvas.height * 0.5);
    // gl.drawTexture(texture_color2, 0, gl.canvas.height * 0.5, gl.canvas.width * 0.5, gl.canvas.height * 0.5);
    // gl.drawTexture(texture_depth2, gl.canvas.width * 0.5, gl.canvas.height * 0.5, gl.canvas.width * 0.5, gl.canvas.height * 0.5);
    //this.gl.drawTexture(this.textureColorId, 0,0, gl.canvas.width * 0.5, gl.canvas.height * 0.5);
}
