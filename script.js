var viewPortAspect = vec2.create();



function init() {
    //create the rendering context
    var container = document.body;

    var gl = GL.create({
        width: container.offsetWidth,
        height: container.offsetHeight,
        antialias: false
    });
    container.appendChild(gl.canvas);
    gl.animate();

    var type = gl.UNSIGNED_BYTE;
    var textureColorOpaque = new GL.Texture(
        container.offsetWidth,
        container.offsetHeight,
        { type: type, filter: gl.NEAREST });
    var textureDepthOpaque = new GL.Texture(
        container.offsetWidth,
        container.offsetHeight,
        { format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_INT, filter: gl.NEAREST });
    var textureColorTransparent = new GL.Texture(
        container.offsetWidth,
        container.offsetHeight,
        { type: type, filter: gl.NEAREST });
    var textureDepthTransparent = new GL.Texture(
        container.offsetWidth,
        container.offsetHeight,
        { format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_INT, filter: gl.NEAREST });
    var textureColorId = new GL.Texture(
        container.offsetWidth,
        container.offsetHeight,
        { type: gl.UNSIGNED_BYTE, filter: gl.NEAREST });
    var textureDepthId = new GL.Texture(
        container.offsetWidth,
        container.offsetHeight,
        { format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_INT, filter: gl.LINEAR });
    var fboOpaque = new GL.FBO([textureColorOpaque], textureDepthOpaque);
    var fboTransparent = new GL.FBO([textureColorTransparent], textureDepthTransparent);
    var fboId = new GL.FBO([textureColorId], textureDepthId);

    var shader = Shader.fromURL("merge.vert", "merge.frag");

    var cam_pos = [0, 0, gl.canvas.height / 2 / Math.tan(22.5 * DEG2RAD)];
    
    var persp = mat4.create();
    var view = mat4.create();
    var mvp = mat4.create();

    var animation = true;

    var cam_angle = 0.0;
    var need_update = true;
    
    //get mouse actions
    gl.captureMouse();
    gl.onmousemove = function(e) {
	if (e.dragging) {
            animation = false;
            need_update = true;
            
            if (e.ctrlKey) {
                cam_pos[0] -= e.deltax;
	        cam_pos[1] += e.deltay;
                mat4.lookAt(view, cam_pos, [cam_pos[0], cam_pos[1], 0], [0, 1, 0]);
            } else {
                mat4.rotateY(view, view, e.deltax * 0.01);
                //mat4.rotateX(view, view, e.deltay * 0.01);
            }
	}
    }
    gl.onmousedown = function(e) {
        var color = new Uint8Array(4);
        
        fboId.bind(true);
        gl.readPixels(e.canvasx, e.canvasy, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
        fboId.unbind();
        
        console.log(colorToId(color));
    }

    var lineMesh = new LineMesh();
    lineMesh.addPoint(0, 150, 0);
    lineMesh.addPoint(50, 200, 0);
    lineMesh.addPoint(100, 200, 0);
    lineMesh.addPoint(150, 150, 0);
    lineMesh.addPoint(150, 100, 0);
    lineMesh.addPoint(0, -100, 0);
    lineMesh.addPoint(-150, 100, 0);
    lineMesh.addPoint(-150, 150, 0);
    lineMesh.addPoint(-100, 200, 0);
    lineMesh.addPoint(-50, 200, 0);
    lineMesh.addPoint(0, 150, 0);

    var pointMesh = new PointMesh();
    pointMesh.addPoint(0, 0, 100, {r: 50, id: 100});
    pointMesh.addPoint(300, 0, 0, {r: 5, id: 12345678});
    pointMesh.addPoint(0, 300, 0, {r: 10, id: 3});

    //set the camera position
    mat4.perspective(persp, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, -500, 500);
    mat4.lookAt(view, cam_pos, [cam_pos[0], cam_pos[1], 0], [0, 1, 0]);
    vec2.set(viewPortAspect, 2 / gl.canvas.width, 2 / gl.canvas.height);

    //generic gl flags and settings
    gl.depthFunc(gl.LESS);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.onupdate = function(dt)
    {
        if (animation) {
            mat4.rotateY(view, view, dt * 0.4);
            need_update = true;
        }
    };

    //rendering loop
    gl.ondraw = function() {
        if (need_update) {
            mat4.multiply(mvp, persp, view);
            need_update = false;
            lineMesh.transform(mvp);
            pointMesh.transform(mvp);
        }

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        
        fboOpaque.bind(true);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        lineMesh.draw(gl, 1);
        pointMesh.draw(gl, 1);
        fboOpaque.unbind();

        fboTransparent.bind(true);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        lineMesh.draw(gl, 2);
        pointMesh.draw(gl, 2);
        fboTransparent.unbind();

        fboId.bind(true);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        lineMesh.draw(gl, 3);
        pointMesh.draw(gl, 3);
        fboId.unbind();

        var quad = GL.Mesh.getScreenQuad();

        gl.clearColor(0.5, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        
        textureColorOpaque.bind(0);
        textureDepthOpaque.bind(1);
        textureColorTransparent.bind(2);
        textureDepthTransparent.bind(3);

        shader.uniforms({
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
        gl.drawTexture(textureColorId, 0,0, gl.canvas.width * 0.5, gl.canvas.height * 0.5);
    };
}
