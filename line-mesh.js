LineMesh = function() {
    this.thickness = 3;
    this.pattern = 50;
    this.space = 10;
    this.antialias = 2;

    this.length = 0;
    this.pointsOrig = [];
    this.pointsTrans = [];
    this.anglesTrans = [];
    this.lengthsTrans = [];
    
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

    this.shader = Shader.fromURL("shader.vert", "shader.frag");
}

LineMesh.prototype.addPoint = function(x, y, z)
{
    var p = vec3.create();
    vec3.set(p, x, y, z);

    this.length += 1;
    this.pointsOrig.push(p);
    this.pointsTrans.push(vec3.create());
    this.anglesTrans.push(0);
    this.lengthsTrans.push(0);
}

LineMesh.prototype.transform = function(mat)
{
    var i, temp = vec2.create();

    if (this.length < 2) {
        throw ("number of points is not enough to draw line");
    }

    for (i = 0; i < this.length; ++i) {
        vec3.transformMat4(this.pointsTrans[i], this.pointsOrig[i], mat);
    }

    this.lengthsTrans[0] = 0.0;
    for (i = 0; i < this.length-1; ++i) {
        vec2.set(temp,
                 (this.pointsTrans[i+1][0] - this.pointsTrans[i][0]) / viewPortAspect[0],
                 (this.pointsTrans[i+1][1] - this.pointsTrans[i][1]) / viewPortAspect[1]);
        this.lengthsTrans[i+1] = this.lengthsTrans[i] + Math.sqrt(temp[0]*temp[0] + temp[1]*temp[1]);
        this.anglesTrans[i] = Math.atan2(temp[1], temp[0]);
    }
    this.anglesTrans[this.length - 1] = 0.0;

    this.upload();    
}

LineMesh.prototype.upload = function() {
    var i, j, right, top, point, mul, vertex;

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
            
            point = this.pointsTrans[right ? i + 1 : i];
            this.data.vertex[6*3*i + 3*j + 0] = point[0];
            this.data.vertex[6*3*i + 3*j + 1] = point[1];
            this.data.vertex[6*3*i + 3*j + 2] = point[2];

            this.data.angles[6*i + j] = this.anglesTrans[i]
                + Math.PI * (top ? 1.0 : -1.0) * (right ? 1.0 : 3.0) / 4;

            this.data.positions[6*2*i + 2*j + 0] = this.lengthsTrans[right ? i + 1 : i];
            this.data.positions[6*2*i + 2*j + 1] = top ? -this.thickness : this.thickness;
        }
    }

    this.buffers.a_vertex.upload();
    this.buffers.a_angle.upload();
    this.buffers.a_position.upload();
}

LineMesh.prototype.draw = function(gl, persp) {
    this.shader.uniforms({
	u_mvp: persp,
        u_thickness: this.thickness,
        u_antialias: this.antialias,
        u_pattern: this.pattern,
        u_space: this.space,
        u_period: this.pattern + this.space,
        u_aspect: viewPortAspect
    }).drawBuffers(this.buffers, null, gl.TRIANGLES);
}
