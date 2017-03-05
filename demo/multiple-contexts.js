"use strict";

var core = require("../core/main.js");
var utils = require("../utils/main.js");
var primitivies = require("../primitivies/main.js");

function init() {
    var container, context, scene, i,
        simTrans = new utils.SimplexTransformation(200);

    for (i = 0; i < 2; ++i) {
        container = document.createElement("div");
        container.style = "width: 50%; display: inline-block;";
        document.body.appendChild(container);

        context = new core.Context({
            width: container.offsetWidth,
            height: container.offsetHeight,
            antialias: false
        });
        container.appendChild(context.canvas);

        scene = new core.Scene(context, {
            bkColor: "#662222",
            transparentSteps: 2,
            distance: 600
        });

        scene.setCameraRotation(quat.fromValues(0.303, 0.102, 0.748, 0.580));
        //scene.setCameraBehavior(new core.cameraBehaviors.AutoRotating(0, 1, 0, (i % 2 ? 1 : -1) *Math.PI / 6.0));
        scene.setCameraBehavior(new core.cameraBehaviors.OrbitalMouse());
    
        new primitivies.SimplexMesh(simTrans, {"color": "#000000"})
            .setScene(scene);
    
        scene.draw();
    }
}

window.init = init;
