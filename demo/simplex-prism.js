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

    var simTrans = new utils.SimplexPrismTransformation(150, new utils.LinearTransformation(300, 0, 100));
    var fr = new utils.FlatRender();

    new primitivies.PointMesh()
        .addPoint(simTrans.toPoint([6, 10, 40, 0]), {color: colors[0], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([4, 16, 46, 6]), {color: colors[0], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([8, 11, 33, 12]), {color: colors[0], radius: 10, id: 1})
        .addPoint(simTrans.toPoint([7, 10, 44, 20]), {color: colors[0], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([4, 23, 45, 10]), {color: colors[0], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([6, 15, 46, 14]), {color: colors[0], radius: 6, id: 1})

        .addPoint(simTrans.toPoint([27, 27, 24, 40]), {color: colors[1], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([36, 16, 59, 39]), {color: colors[1], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([20, 20, 23, 36]), {color: colors[1], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([22, 22, 38, 21]), {color: colors[1], radius: 10, id: 1})
        .addPoint(simTrans.toPoint([28, 28, 28, 30]), {color: colors[1], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([32, 12, 36, 28]), {color: colors[1], radius: 6, id: 1})

        .addPoint(simTrans.toPoint([37, 34, 2, 71]), {color: colors[2], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([13, 22, 5, 53]), {color: colors[2], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([44, 48, 2, 88]), {color: colors[2], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([20, 24, 6, 78]), {color: colors[2], radius: 10, id: 1})
        .addPoint(simTrans.toPoint([15, 21, 6, 65]), {color: colors[2], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([37, 43, 2, 74]), {color: colors[2], radius: 6, id: 1})

        .addPoint(simTrans.toPoint([50, 29, 11, 92]), {color: colors[3], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 29, 19, 94]), {color: colors[3], radius: 10, id: 1})
        .addPoint(simTrans.toPoint([50, 24, 25, 94]), {color: colors[3], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 39, 11, 95]), {color: colors[3], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 17, 10, 91]), {color: colors[3], radius: 6, id: 1})
        .addPoint(simTrans.toPoint([50, 45, 16, 97]), {color: colors[3], radius: 6, id: 1})
        .setScene(scene);

    new primitivies.LineMesh({"color": "#000000", "pattern": [0.0]})
        .addPoint(simTrans.toPoint([8, 11, 33, 12]))
        .addPoint(simTrans.toPoint([22, 22, 38, 21]))
        .addPoint(simTrans.toPoint([20, 24, 6, 78]))
        .addPoint(simTrans.toPoint([50, 29, 19, 94]))
        .setScene(scene);

    new primitivies.SimplexPrismMesh(simTrans, {"color": "#000000"})
        .setScene(scene);

    fr.distance = simTrans.progressTransformation.toPoint(28);
    new primitivies.SimplexDistanceMesh(simTrans.simplexTransformation, {colors: colors, flatRender: fr})
        .addPoint([20, 24, 6])
        .setScene(scene);

    scene.draw();
}

window.init = init;
