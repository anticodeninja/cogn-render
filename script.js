function setCamera(scene, distance, angleX, angleY) {
    scene.setCamera([
        distance * Math.sin(angleY) * Math.cos(angleX),
        distance * Math.sin(angleX),
        distance * Math.cos(angleY) * Math.cos(angleX)
    ], [0, 0, 0], [0, 1, 0]);
}

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

    var camDistance = 600.0;
    var camAngleX = 0.0;
    var camAngleY = 0.0;
    
    var scene = new Scene(gl);
    setCamera(scene, camDistance, camAngleX, camAngleY);
    var animation = true;
    
    //get mouse actions
    gl.captureMouse();
    gl.onmousemove = function(e) {
	if (e.dragging) {
            animation = false;
            scene.invalidate();
            
            if (!e.ctrlKey) {
                camAngleX += e.deltay / 100.0;
                camAngleY += e.deltax / 100.0;
                setCamera(scene, camDistance, camAngleX, camAngleY);
            } else {
            }
	}
    }
    
    gl.onmousedown = function(e) {
        console.log(scene.getObjectId(e.canvasx, e.canvasy));
    }

    var lineMesh = new LineMesh()
        .addPoint(0, 150, 0)
        .addPoint(50, 200, 0)
        .addPoint(100, 200, 0)
        .addPoint(150, 150, 0)
        .addPoint(150, 100, 0)
        .addPoint(0, -100, 0)
        .addPoint(-150, 100, 0)
        .addPoint(-150, 150, 0)
        .addPoint(-100, 200, 0)
        .addPoint(-50, 200, 0)
        .addPoint(0, 150, 0)
        .setScene(scene);

    var pointMesh = new PointMesh()
        .addPoint(0, 0, 100, {r: 50, id: 100})
        .addPoint(300, 0, 0, {r: 5, id: 12345678})
        .addPoint(0, 300, 0, {r: 10, id: 3})
        .setScene(scene);

    gl.onupdate = function(dt)
    {
        if (animation) {
            camAngleY += dt * 0.4;
            setCamera(scene, camDistance, camAngleX, camAngleY);
            scene.invalidate();
        }
    };
}
