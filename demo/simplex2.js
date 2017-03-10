"use strict";

var core = require("../core/main.js");
var utils = require("../utils/main.js");
var primitivies = require("../primitivies/main.js");

function init() {
    var container = document.body;
    var colors = ["#e01b1b", "#f7f307", "#07f70b"];

    var context = new core.Context({
        width: container.offsetWidth,
        height: container.offsetHeight,
        antialias: false
    });
    
    container.appendChild(context.canvas);

    var scene = new core.Scene(context, {
        bkColor: "#662222",
        transparentSteps: 2,
        distance: 600,
        projection: 'ortho'
    });

    scene.setCameraBehavior(new core.cameraBehaviors.FlatMouse());

    var simTrans = new utils.SimplexTransformation(200);
    var fr = new utils.FlatRender();

    fr.distance = 0;
    new primitivies.SimplexMesh(simTrans, {color: "#000000", flatRender: fr})
        .setScene(scene);

    fr.distance = 100;
    new primitivies.PointMesh()
        .addPoint(fr.to3D(simTrans.toPoint([6, 10, 40])), {color: colors[0], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([4, 16, 46])), {color: colors[0], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([8, 11, 33])), {color: colors[0], radius: 10, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([7, 10, 44])), {color: colors[0], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([4, 23, 45])), {color: colors[0], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([6, 15, 46])), {color: colors[0], radius: 6, id: 1})

        .addPoint(fr.to3D(simTrans.toPoint([27, 9, 24])), {color: colors[1], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([36, 5, 59])), {color: colors[1], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([20, 6, 23])), {color: colors[1], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([22, 7, 38])), {color: colors[1], radius: 10, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([28, 9, 28])), {color: colors[1], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([32, 4, 36])), {color: colors[1], radius: 6, id: 1})

        .addPoint(fr.to3D(simTrans.toPoint([37, 34, 2])), {color: colors[2], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([13, 22, 5])), {color: colors[2], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([44, 48, 2])), {color: colors[2], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([20, 24, 6])), {color: colors[2], radius: 10, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([15, 21, 6])), {color: colors[2], radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([37, 43, 2])), {color: colors[2], radius: 6, id: 1})

        .setScene(scene);

    fr.distance = 200;
    new primitivies.LineMesh({color: "#000000", pattern: [0.0]})
        .addPoint(fr.to3D(simTrans.toPoint([8, 11, 33])))
        .addPoint(fr.to3D(simTrans.toPoint([22, 7, 38])))
        .addPoint(fr.to3D(simTrans.toPoint([20, 24, 6])))
        .setScene(scene);

    fr.distance = 300;
    new primitivies.SimplexDistanceMesh(simTrans, {colors: colors, flatRender: fr})
        .addPoint([22, 7, 38])
        .setScene(scene);

    scene.draw();
}

window.init = init;
