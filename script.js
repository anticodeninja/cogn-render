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
    //gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    //var point = [gl.canvas.width, gl.canvas.height];
    var point = [590, 00];
    var angle = Math.atan2(point[1], point[0]);
    var angle2 = Math.atan2(point[0], point[1]);
    var length = Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[1], 2));
    var thickness = 10;
    var pattern = 50;
    var space = 10;
    var antialias = 2;
    
    var mesh = GL.Mesh.load({
        vertices: [
            0, 0, 0,
            point[0], point[1], 0,
            point[0], point[1], 0,
                   
            0, 0, 0,
            point[0], point[1], 0,
            0, 0, 0,

            0, 0, 0,
            point[1], point[0], 0,
            point[1], point[0], 0,
                   
            0, 0, 0,
            point[1], point[0], 0,
             0, 0, 0
        ],
        extra4: [
            angle - Math.PI * 3 / 4, 0, 0, thickness,
            angle - Math.PI * 1 / 4, 0, length, thickness,
            angle + Math.PI * 1 / 4, 0, length, -thickness,
            
            angle - Math.PI * 3 / 4, 0, 0, thickness,
            angle + Math.PI * 1 / 4, 0, length, -thickness,
            angle + Math.PI * 3 / 4, 0, 0, -thickness,

            angle2 - Math.PI * 3 / 4, 1, 0, thickness,
            angle2 - Math.PI * 1 / 4, 1, length, thickness,
            angle2 + Math.PI * 1 / 4, 1, length, -thickness,
            
            angle2 - Math.PI * 3 / 4, 1, 0, thickness,
            angle2 + Math.PI * 1 / 4, 1, length, -thickness,
            angle2 + Math.PI * 3 / 4, 1, 0, -thickness
        ]
    });

    var cam_pos = [0, 0, gl.canvas.height / 2 / Math.tan(22.5 * DEG2RAD)];
    
    var persp = mat4.create();
    var view = mat4.create();
    var mvp = mat4.create();

    var cam_angle = 0.0;
    //get mouse actions
    gl.captureMouse();
    gl.onmousemove = function(e) {
	if (e.dragging) {
            cam_pos[0] -= e.deltax;
	    cam_pos[1] += e.deltay;
	}
    }

    //set the camera position
    mat4.perspective(persp, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0, 1000);
    //mat4.ortho(persp, 0, gl.canvas.width, 0, gl.canvas.height, 0, 10000);
    //mat4.lookAt(view, cam_pos, [cam_pos[0], cam_pos[1], cam_pos[2]], [0, 1, 0]);

    //basic phong shader
    var shader = Shader.fromURL("shader.vert", "shader.frag");

    //generic gl flags and settings
    //gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clearColor(0, 0, 0, 1);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    //rendering loop
    gl.ondraw = function() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//create modelview and projection matrices
        //mat4.lookAt(view, cam_pos, [cam_pos[0], cam_pos[1], 0], [0, 1, 0]);
        mat4.lookAt(view, cam_pos, [cam_pos[0], cam_pos[1], 0], [0, 1, 0]);
        mat4.multiply(mvp, persp, view);

	//render mesh using the shader
	if (mesh) {
	    shader.uniforms({
		u_mvp: mvp,
                u_thickness: thickness,
                u_antialias: antialias,
                u_pattern: pattern,
                u_space: space,
                u_period: pattern + space,
                u_aspect: [1 / gl.canvas.width, 1 / gl.canvas.height]
	    }).draw(mesh, gl.TRIANGLES);
        }
    };
}
