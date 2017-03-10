"use strict";

var core = require("../core/main.js");
var utils = require("../utils/main.js");
var primitivies = require("../primitivies/main.js");

function init() {
    var container = document.body;
    var colors = ["#e01b1b", "#e0841b", "#f7f307", "#07f70b"];

    var context = new core.Context({
        width: container.offsetWidth,
        height: container.offsetHeight,
        antialias: false
    });
    
    container.appendChild(context.canvas);

    var scene = new core.Scene(context, {
        bkColor: "#662222",
        transparentSteps: 2,
        distance: 600
    });

    scene.setCameraBehavior(new core.cameraBehaviors.AutoRotating(0, 1, 0, Math.PI / 6.0));
    var mouseDownEvent = scene.onMouseDown.add(function() {
        scene.setCameraBehavior(new core.cameraBehaviors.OrbitalMouse());
        scene.onMouseDown.remove(mouseDownEvent);
    });

    var simTrans = new utils.SimplexTransformation(200);

    new primitivies.PointMesh()
        .addPoint(simTrans.toPoint([6, 10, 40, 50]), {color: colors[0], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([4, 16, 46, 50]), {color: colors[0], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([8, 11, 33, 50]), {color: colors[0], radius: 10, id: 1})
        .addPoint(simTrans.toPoint([7, 10, 44, 50]), {color: colors[0], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([4, 23, 45, 50]), {color: colors[0], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([6, 15, 46, 50]), {color: colors[0], radius: 6, id: 1})

        .addPoint(simTrans.toPoint([27, 27, 24, 20]), {color: colors[1], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([36, 16, 59, 21]), {color: colors[1], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([20, 20, 23, 24]), {color: colors[1], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([22, 22, 38, 49]), {color: colors[1], radius: 10, id: 1})
        .addPoint(simTrans.toPoint([28, 28, 28, 40]), {color: colors[1], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([32, 12, 36, 52]), {color: colors[1], radius: 6, id: 1})

        .addPoint(simTrans.toPoint([37, 34, 2, 29]), {color: colors[2], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([13, 22, 5, 47]), {color: colors[2], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([44, 48, 2, 12]), {color: colors[2], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([20, 24, 6, 22]), {color: colors[2], radius: 10, id: 1})
        .addPoint(simTrans.toPoint([15, 21, 6, 35]), {color: colors[2], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([37, 43, 2, 26]), {color: colors[2], radius: 6, id: 1})

        .addPoint(simTrans.toPoint([50, 29, 11, 8]), {color: colors[3], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 29, 19, 6]), {color: colors[3], radius: 10, id: 1})
        .addPoint(simTrans.toPoint([50, 24, 25, 6]), {color: colors[3], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 39, 11, 5]), {color: colors[3], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 17, 10, 9]), {color: colors[3], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 45, 16, 3]), {color: colors[3], radius: 6, id: 1})
        .setScene(scene);

    new primitivies.LineMesh({"color": "#000000", "pattern": [0.0]})
        .addPoint(simTrans.toPoint([8, 11, 33, 50]))
        .addPoint(simTrans.toPoint([22, 22, 38, 49]))
        .addPoint(simTrans.toPoint([20, 24, 6, 22]))
        .addPoint(simTrans.toPoint([50, 29, 19, 6]))
        .setScene(scene);

    new primitivies.SimplexMesh(simTrans, {"color": "#000000"})
        .setScene(scene);

    new primitivies.SimplexDistanceMesh(simTrans, {colors: colors})
        .addPoint([20, 24, 6, 22])
        .setScene(scene);

    scene.draw();
}

window.init = init;
