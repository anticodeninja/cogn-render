"use strict";

var core = require("./core/main.js");
var utils = require("./utils/main.js");
var primitivies = require("./primitivies/main.js");

function setCamera(scene, distance, angleX, angleY) {
    scene.setCamera([
        distance * Math.sin(angleY) * Math.cos(angleX),
        distance * Math.sin(angleX),
        distance * Math.cos(angleY) * Math.cos(angleX)
    ], [0, 0, 0], [0, 1, 0]);
}

function init() {
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

    var scene = new core.Scene(gl, {"bkColor": "#662222"});
    setCamera(scene, camDistance, camAngleX, camAngleY);
    var animation = true;
    var simTrans = new utils.SimplexTransformation(200);

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

    // new PointMesh({ antialias: 10 })
    //     .addPoint([-20, 0,   0], {color: "#ff0000", radius: 100, id: 1})
    //     .addPoint([ 0, 40, 100], {color: "#00ff00", radius: 100, id: 2})
    //     .addPoint([ 20, 0, 200], {color: "#0000ff", radius: 100, id: 3})
    //     .setScene(scene);

    new primitivies.PointMesh()
        .addPoint(simTrans.toPoint([6, 10, 40, 50]), {color: "#e01b1b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([4, 16, 46, 50]), {color: "#e01b1b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([8, 11, 33, 50]), {color: "#e01b1b", radius: 10, id: 1})
        .addPoint(simTrans.toPoint([7, 10, 44, 50]), {color: "#e01b1b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([4, 23, 45, 50]), {color: "#e01b1b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([6, 15, 46, 50]), {color: "#e01b1b", radius: 6, id: 1})

        .addPoint(simTrans.toPoint([27, 27, 24, 20]), {color: "#e0841b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([36, 16, 59, 21]), {color: "#e0841b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([20, 20, 23, 24]), {color: "#e0841b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([22, 22, 38, 49]), {color: "#e0841b", radius: 10, id: 1})
        .addPoint(simTrans.toPoint([28, 28, 28, 40]), {color: "#e0841b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([32, 12, 36, 52]), {color: "#e0841b", radius: 6, id: 1})

        .addPoint(simTrans.toPoint([37, 34, 2, 29]), {color: "#f7f307", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([13, 22, 5, 47]), {color: "#f7f307", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([44, 48, 2, 12]), {color: "#f7f307", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([20, 24, 6, 22]), {color: "#f7f307", radius: 10, id: 1})
        .addPoint(simTrans.toPoint([15, 21, 6, 35]), {color: "#f7f307", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([37, 43, 2, 26]), {color: "#f7f307", radius: 6, id: 1})

        .addPoint(simTrans.toPoint([50, 29, 11, 8]), {color: "#07f70b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 29, 19, 6]), {color: "#07f70b", radius: 10, id: 1})
        .addPoint(simTrans.toPoint([50, 24, 25, 6]), {color: "#07f70b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 39, 11, 5]), {color: "#07f70b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 17, 10, 9]), {color: "#07f70b", radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 45, 16, 3]), {color: "#07f70b", radius: 6, id: 1})
        .setScene(scene);

    new primitivies.LineMesh({"color": "#000000", "pattern": Infinity})
        .addPoint(simTrans.toPoint([8, 11, 33, 50]))
        .addPoint(simTrans.toPoint([22, 22, 38, 49]))
        .addPoint(simTrans.toPoint([20, 24, 6, 22]))
        .addPoint(simTrans.toPoint([50, 29, 19, 6]))
        .setScene(scene);

    new primitivies.SimplexMesh(200, {"color": "#000000"})
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

window.init = init;
