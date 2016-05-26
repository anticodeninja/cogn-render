"use strict";

var core = require("../core/main.js");
var utils = require("../utils/main.js");
var primitivies = require("../primitivies/main.js");

function init() {
    var container = document.body;

    var gl = GL.create({
        width: container.offsetWidth,
        height: container.offsetHeight,
        antialias: false
    });
    
    container.appendChild(gl.canvas);

    var scene = new core.Scene(gl, {
        bkColor: "#662222",
        transparentSteps: 2,
        distance: 600
    });

    scene.setCameraBehavior(new core.cameraBehaviors.AutoRotating(0, 1, 0, Math.PI / 6.0));
    var mouseDownEvent = scene.onMouseDown.add(function() {
        scene.setCameraBehavior(new core.cameraBehaviors.OrbitalMouse());
        scene.onMouseDown.remove(mouseDownEvent);
    });

    new primitivies.PointMesh({ antialias: 2 })
        .addPoint([  0, 0, 150], {color: "#333333ff", radius: 100, id: 1})
        .addPoint([-10, 0, 100], {color: "#ff000080", radius: 100, id: 2})
        .addPoint([ 0, 20, 200], {color: "#00ff0080", radius: 100, id: 3})
        .addPoint([ 10, 0, 300], {color: "#0000ff80", radius: 100, id: 4})
        .setScene(scene);

    new primitivies.LineMesh(({"color": "#000000", "thickness": 4, "pattern": [40,10,10,10]}))
        .addPoint([-200,   0, 0])
        .addPoint([   0, 200, 100])
        .addPoint([ 200,   0, 200])
        .setScene(scene);
    
    new primitivies.LineMesh(({"color": "#000000", "thickness": 4, "pattern": [0]}))
        .addPoint([ 200,    0, 0])
        .addPoint([   0, -200, 100])
        .addPoint([-200,    0, 200])
        .setScene(scene);
    
    new primitivies.SimplexMesh(200, {"color": "#000000"})
        .setScene(scene);

    scene.draw();
}

window.init = init;
