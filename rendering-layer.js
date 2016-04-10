RenderingLayer = function(gl, useFilter) {
    this.gl = gl;
    
    this.color = new GL.Texture(
        gl.canvas.width,
        gl.canvas.height,
        {
            type: gl.UNSIGNED_BYTE,
            filter: gl.NEAREST
        });
    
    this.depth = new GL.Texture(
        gl.canvas.width,
        gl.canvas.height,
        {
            format: gl.DEPTH_COMPONENT,
            type: gl.UNSIGNED_INT,
            filter: useFilter ? gl.NEAREST : gl.LINEAR
        });
    
    this.fbo = new GL.FBO([this.color], this.depth);
}
