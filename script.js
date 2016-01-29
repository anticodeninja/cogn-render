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
    var point = [
        300, 300,
        450, 150
    ];
    var angle = Math.atan2(point[1], point[0]);
    var angle2 = Math.atan2(point[3]-point[1], point[2]-point[0]);
    var length = Math.sqrt(Math.pow(point[1], 2) + Math.pow(point[0], 2));
    var length2 = Math.sqrt(Math.pow(point[3] - point[1], 2) + Math.pow(point[2]-point[0], 2)) + length;
    var thickness = 3;
    var pattern = 50;
    var space = 10;
    var antialias = 2;

    var buffers = {
        a_vertex: new GL.Buffer(gl.ARRAY_BUFFER, new Float32Array([
            0, 0, 0,
            point[0], point[1], 0,
            point[0], point[1], 0,
                   
            0, 0, 0,
            point[0], point[1], 0,
            0, 0, 0,

            point[0], point[1], 0,
            point[2], point[3], 0,
            point[2], point[3], 0,
                   
            point[0], point[1], 0,
            point[2], point[3], 0,
            point[0], point[1], 0
        ]), 3, gl.STATIC_DRAW),
        
        a_angle: new GL.Buffer(gl.ARRAY_BUFFER, new Float32Array([
            angle - Math.PI * 3 / 4,
            angle - Math.PI * 1 / 4,
            angle + Math.PI * 1 / 4,
            
            angle - Math.PI * 3 / 4,
            angle + Math.PI * 1 / 4,
            angle + Math.PI * 3 / 4,

            angle2 - Math.PI * 3 / 4,
            angle2 - Math.PI * 1 / 4,
            angle2 + Math.PI * 1 / 4,
            
            angle2 - Math.PI * 3 / 4,
            angle2 + Math.PI * 1 / 4,
            angle2 + Math.PI * 3 / 4
        ]), 1, gl.STATIC_DRAW),
        
        a_pos: new GL.Buffer(gl.ARRAY_BUFFER, new Float32Array([
            0, thickness,
            length, thickness,
            length, -thickness,
            
            0, thickness,
            length, -thickness,
            0, -thickness,

            length, thickness,
            length2, thickness,
            length2, -thickness,
            
            length, thickness,
            length2, -thickness,
            length, -thickness
        ]), 2, gl.STATIC_DRAW)
    };

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


	shader.uniforms({
	    u_mvp: mvp,
            u_thickness: thickness,
            u_antialias: antialias,
            u_pattern: pattern,
            u_space: space,
            u_period: pattern + space,
            u_aspect: [2 / gl.canvas.width, 2 / gl.canvas.height]
	}).drawBuffers(buffers, null, gl.TRIANGLES);
    };
}
