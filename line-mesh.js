LineMesh = function() {
    this.constructor.prototype.constructor();
    
    this.thickness = 3;
    this.pattern = 50;
    this.space = 10;
    this.antialias = 2;

    this.length = 0;
    this.points = [];
    this.angles = [];
    this.lengths = [];
    
    this.data = {
        vertexes: null,
        angles: null,
        positions: null
    };

    this.buffers = {
        a_vertex: null,
        a_angle: null,
        a_position: null
    };

    this.shader = Shader.fromURL("line.vert", "line.frag");
}

LineMesh.prototype = Object.create(BaseMesh.prototype);

LineMesh.prototype.addPoint = function(value)
{
    var p = vec3.create();
    vec3.copy(p, value);

    this.length += 1;
    this.points.push(p);
    this.angles.push(0);
    this.lengths.push(0);

    return this;
}

LineMesh.prototype.transform = function(mat)
{
    this.constructor.prototype.transform(mat);
    var i,
        prev = vec3.create(),
        next = vec3.create(),
        temp = vec2.create();

    if (this.length < 2) {
        throw ("number of points is not enough to draw line");
    }

    this.lengths[0] = 0.0;
    this.angles[this.length - 1] = 0.0;
    
    vec3.transformMat4(prev, this.points[0], mat);
    for (i = 1; i < this.length; ++i) {
        vec3.transformMat4(next, this.points[i], mat);
        vec2.set(temp,
                 (next[0] - prev[0]) / this.scene.cameraAspect[0],
                 (next[1] - prev[1]) / this.scene.cameraAspect[1]);
        
        this.lengths[i] = this.lengths[i - 1] + Math.sqrt(temp[0]*temp[0] + temp[1]*temp[1]);
        this.angles[i - 1] = Math.atan2(temp[1], temp[0]);
        
        vec3.copy(prev, next);
    }

    this.upload();    
}

LineMesh.prototype.upload = function() {
    var i, j, right, top, point;

    vertex = 6 * (this.length - 1);
    
    if (this.data.vertex == null || (this.data.vertex.length !== 3 * vertex)) {
        this.data.vertex = new Float32Array(3 * vertex);
        this.buffers.a_vertex = new GL.Buffer(gl.ARRAY_BUFFER, this.data.vertex, 3, gl.DYNAMIC_DRAW);
    }

    if (this.data.angles == null || (this.data.angles.length !== vertex)) {
        this.data.angles = new Float32Array(vertex);
        this.buffers.a_angle = new GL.Buffer(gl.ARRAY_BUFFER, this.data.angles, 1, gl.DYNAMIC_DRAW);
    }

    if (this.data.positions == null || (this.data.positions.length !== 2 * vertex)) {
        this.data.positions = new Float32Array(2 * vertex);
        this.buffers.a_position = new GL.Buffer(gl.ARRAY_BUFFER, this.data.positions, 2, gl.DYNAMIC_DRAW);
    }

    for (i = 0; i < this.length - 1; ++i) {
        for (j = 0; j < 6; ++j) {
            top = j == 2 || j == 4 || j == 5;
            right = j == 1 || j == 2 || j == 4;
            
            point = this.points[right ? i + 1 : i];
            this.data.vertex[6*3*i + 3*j + 0] = point[0];
            this.data.vertex[6*3*i + 3*j + 1] = point[1];
            this.data.vertex[6*3*i + 3*j + 2] = point[2];

            this.data.angles[6*i + j] = this.angles[i]
                + Math.PI * (top ? 1.0 : -1.0) * (right ? 1.0 : 3.0) / 4;

            this.data.positions[6*2*i + 2*j + 0] = this.lengths[right ? i + 1 : i];
            this.data.positions[6*2*i + 2*j + 1] = top ? -this.thickness : this.thickness;
        }
    }

    this.buffers.a_vertex.upload();
    this.buffers.a_angle.upload();
    this.buffers.a_position.upload();
}

LineMesh.prototype.draw = function(step) {
    this.shader.uniforms({
        u_mvp: this.mvp,
        u_step: step,
        u_texture: 0,
        u_depth: 1,
        u_thickness: this.thickness,
        u_antialias: this.antialias,
        u_pattern: this.pattern,
        u_space: this.space,
        u_period: this.pattern + this.space,
        u_aspect: this.scene.cameraAspect,
    }).drawBuffers(this.buffers, null, gl.TRIANGLES);
}
