var core = require("../core/main.js");

function RenderingLayer(context, useFilter) {
    var gl = context.gl;
    this.context = context;

    this.color = new core.Texture(
        this.context,
        this.context.canvas.width,
        this.context.canvas.height,
        {
            type: gl.UNSIGNED_BYTE,
            filter: gl.NEAREST,
            ignore_pot: true
        });

    this.depth = new core.Texture(
        this.context,
        this.context.canvas.width,
        this.context.canvas.height,
        {
            format: gl.DEPTH_COMPONENT,
            type: gl.UNSIGNED_INT,
            filter: useFilter ? gl.NEAREST : gl.LINEAR,
            ignore_pot: true
        });

    this.fbo = new core.FBO(
        this.context,
        [this.color],
        this.depth);
}

module.exports = RenderingLayer;
