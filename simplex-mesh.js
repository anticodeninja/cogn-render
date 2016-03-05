SimplexMesh = function(height, options) {
    var vertex = 6 * 6,
        simTrans = new SimplexTransformation(height);
    
    this.constructor.prototype.constructor();

    options = options || {};

    this.color = colorToArray(options.color || "#ffffff");
    this.thickness = options.thickness || 3;
    this.pattern = options.pattern || 50;
    this.space = options.space || 10;
    this.antialias = options.antialias || 2;

    this.points = [
        simTrans.toPoint([1, 0, 0, 0]),
        simTrans.toPoint([0, 1, 0, 0]),
        simTrans.toPoint([0, 0, 1, 0]),
        simTrans.toPoint([0, 0, 0, 1]), 
    ];
    this.pointTransformed = [
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create()
    ];
    this.lines = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [2, 3],
        [3, 1]
    ];
    this.angles = [
        0, 0, 0, 0, 0, 0
    ];
    this.lengths = [
        0, 0, 0, 0, 0, 0
    ];
    this.edgePoints = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 1],
        [1, 3, 2]
    ];
    this.edgeLines = [
        [0, 3, 1],
        [1, 4, 2],
        [2, 5, 0],
        [3, 4, 5]
    ];
    this.front = [
        true, true, true, false, false, false
    ]
    
    this.data = {
        vertexes: new Float32Array(3 * vertex),
        angles: new Float32Array(vertex),
        positions: new Float32Array(2 * vertex)
    };

    this.buffers = {
        a_vertex: new GL.Buffer(gl.ARRAY_BUFFER, this.data.vertexes, 3, gl.DYNAMIC_DRAW),
        a_angle: new GL.Buffer(gl.ARRAY_BUFFER, this.data.angles, 1, gl.DYNAMIC_DRAW),
        a_position: new GL.Buffer(gl.ARRAY_BUFFER, this.data.positions, 2, gl.DYNAMIC_DRAW)
    };

    this.shader = Shader.fromURL("line.vert", "line.frag");   
}

SimplexMesh.prototype = Object.create(BaseMesh.prototype);

SimplexMesh.prototype.transform = function(mat)
{
    this.constructor.prototype.transform(mat);
    var i, j,
        prev = vec3.create(),
        next = vec3.create(),
        temp2 = vec2.create(),
        temp3 = vec3.create();
    
    for (i = 0; i < this.points.length; ++i) {
        vec3.transformMat4(this.pointTransformed[i], this.points[i], mat);
    }

    for (i = 0; i < this.lines.length; ++i) {
        vec3.copy(prev, this.pointTransformed[this.lines[i][0]]);
        vec3.copy(next, this.pointTransformed[this.lines[i][1]]);
        
        vec2.set(temp2,
                 (next[0] - prev[0]) / this.scene.cameraAspect[0],
                 (next[1] - prev[1]) / this.scene.cameraAspect[1]);
        
        this.lengths[i] = Math.sqrt(temp2[0]*temp2[0] + temp2[1]*temp2[1]);
        this.angles[i] = Math.atan2(temp2[1], temp2[0]);
        this.front[i] = false;
    }

    for (i = 0; i < this.edgePoints.length; ++i) {
        vec3.subtract(prev,
                      this.pointTransformed[this.edgePoints[i][0]],
                      this.pointTransformed[this.edgePoints[i][1]]);
        vec3.subtract(next,
                      this.pointTransformed[this.edgePoints[i][1]],
                      this.pointTransformed[this.edgePoints[i][2]]);
        
        vec3.cross(temp3, prev, next);
        if (temp3[2] < 0) {
            for (j = 0; j < this.edgeLines[i].length; ++j) {
                this.front[this.edgeLines[i][j]] = true;
            }
        }
    }

    this.upload();    
}

SimplexMesh.prototype.upload = function() {
    var i, j, right, top, point;

    for (i = 0; i < this.lines.length; ++i) {
        for (j = 0; j < 6; ++j) {
            top = j == 2 || j == 4 || j == 5;
            right = j == 1 || j == 2 || j == 4;
            
            point = this.points[right ? this.lines[i][1] : this.lines[i][0]];
            this.data.vertexes[6*3*i + 3*j + 0] = point[0];
            this.data.vertexes[6*3*i + 3*j + 1] = point[1];
            this.data.vertexes[6*3*i + 3*j + 2] = point[2];

            this.data.angles[6*i + j] = this.angles[i]
                + Math.PI * (top ? 1.0 : -1.0) * (right ? 1.0 : 3.0) / 4;

            this.data.positions[6*2*i + 2*j + 0] = right ? (this.front[i] ? this.period : this.lengths[i]) : 0;
            this.data.positions[6*2*i + 2*j + 1] = top ? -this.thickness : this.thickness;
        }
    }

    this.buffers.a_vertex.upload();
    this.buffers.a_angle.upload();
    this.buffers.a_position.upload();
}

SimplexMesh.prototype.draw = function(step) {
    this.shader.uniforms({
        u_mvp: this.mvp,
        u_color: this.color,
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
