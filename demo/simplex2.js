"use strict";

var core = require("../core/main.js");
var utils = require("../utils/main.js");
var primitivies = require("../primitivies/main.js");

function init() {
    var container = document.body;

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
    new primitivies.SimplexMesh(simTrans, {"color": "#000000", flatRender: fr})
        .setScene(scene);

    fr.distance = 100;
    new primitivies.PointMesh()
        .addPoint(fr.to3D(simTrans.toPoint([6, 10, 40])), {color: "#e01b1b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([4, 16, 46])), {color: "#e01b1b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([8, 11, 33])), {color: "#e01b1b", radius: 10, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([7, 10, 44])), {color: "#e01b1b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([4, 23, 45])), {color: "#e01b1b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([6, 15, 46])), {color: "#e01b1b", radius: 6, id: 1})

        .addPoint(fr.to3D(simTrans.toPoint([27, 27, 24])), {color: "#e0841b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([36, 16, 59])), {color: "#e0841b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([20, 20, 23])), {color: "#e0841b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([22, 22, 38])), {color: "#e0841b", radius: 10, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([28, 28, 28])), {color: "#e0841b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([32, 12, 36])), {color: "#e0841b", radius: 6, id: 1})

        .addPoint(fr.to3D(simTrans.toPoint([37, 34, 2])), {color: "#f7f307", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([13, 22, 5])), {color: "#f7f307", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([44, 48, 2])), {color: "#f7f307", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([20, 24, 6])), {color: "#f7f307", radius: 10, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([15, 21, 6])), {color: "#f7f307", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([37, 43, 2])), {color: "#f7f307", radius: 6, id: 1})

        .addPoint(fr.to3D(simTrans.toPoint([50, 29, 11])), {color: "#07f70b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([50, 29, 19])), {color: "#07f70b", radius: 10, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([50, 24, 25])), {color: "#07f70b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([50, 39, 11])), {color: "#07f70b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([50, 17, 10])), {color: "#07f70b", radius: 6, id: 1})
        .addPoint(fr.to3D(simTrans.toPoint([50, 45, 16])), {color: "#07f70b", radius: 6, id: 1})
        .setScene(scene);

    fr.distance = 200;
    new primitivies.LineMesh({"color": "#000000", "pattern": [0.0]})
        .addPoint(fr.to3D(simTrans.toPoint([8, 11, 33])))
        .addPoint(fr.to3D(simTrans.toPoint([22, 22, 38])))
        .addPoint(fr.to3D(simTrans.toPoint([20, 24, 6])))
        .addPoint(fr.to3D(simTrans.toPoint([50, 29, 19])))
        .setScene(scene);

    scene.draw();
}

window.init = init;
