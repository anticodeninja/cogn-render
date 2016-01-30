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

    var cam_pos = [0, 0, gl.canvas.height / 2 / Math.tan(22.5 * DEG2RAD)];
    
    var persp = mat4.create();
    var view = mat4.create();
    var mvp = mat4.create();

    var cam_angle = 0.0;
    var need_update = true;
    
    //get mouse actions
    gl.captureMouse();
    gl.onmousemove = function(e) {
	if (e.dragging) {
            need_update = true;
            if (e.ctrlKey) {
                mat4.rotateY(view, view, e.deltax * 0.01);
                mat4.rotateX(view, view, e.deltay * 0.01);
            } else {
                cam_pos[0] -= e.deltax;
	        cam_pos[1] += e.deltay;
                mat4.lookAt(view, cam_pos, [cam_pos[0], cam_pos[1], 0], [0, 1, 0]);
            }
	}
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

    //set the camera position
    mat4.perspective(persp, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0, 1000);
    mat4.lookAt(view, cam_pos, [cam_pos[0], cam_pos[1], 0], [0, 1, 0]);
    vec2.set(viewPortAspect, 2 / gl.canvas.width, 2 / gl.canvas.height);

    //generic gl flags and settings
    //gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clearColor(0, 0, 0, 1);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    //rendering loop
    gl.ondraw = function() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        if (need_update) {
            mat4.multiply(mvp, persp, view);
            need_update = false;
            lineMesh.transform(mvp);
        }
        
        lineMesh.draw(gl, persp);
    };
}
