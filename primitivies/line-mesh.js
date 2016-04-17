var core = require("../core/main.js");
var utils = require("../utils/main.js");
var vertShader = require("./line.vert");
var fragShader = require("./line.frag");

var LineMesh = function(options) {
    this.constructor.prototype.constructor();

    options = options || {};

    this.color = utils.colorToArray(utils.expandDefault(options.color, "#000000"));
    this.thickness = utils.expandDefault(options.thickness, 3);
    this.pattern = utils.generatePattern(utils.expandDefault(options.pattern, [50, 10]));
    this.antialias = utils.expandDefault(options.antialias, 2);

    this.length = 0;
    this.points = [];
    this.angles = [];
    this.lengths = [];
    this.offsets = [];

    this.data = {
        vertexes: null,
        angles: null,
        lengths: null,
        offsets: null,
        positions: null
    };

    this.buffers = {
        a_vertex: null,
        a_angle: null,
        a_length: null,
        a_offset: null,
        a_position: null
    };

    this.shader = new Shader(vertShader, fragShader);
}

LineMesh.prototype = Object.create(core.BaseMesh.prototype);

LineMesh.prototype.addPoint = function(value)
{
    this.length += 1;
    this.points.push(vec3.clone(value));
    this.angles.push(0);
    this.lengths.push(0);
    this.offsets.push(0);

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
    this.offsets[0] = 0.0;
    this.angles[this.length - 1] = 0.0;

    vec3.transformMat4(prev, this.points[0], mat);
    for (i = 1; i < this.length; ++i) {
        vec3.transformMat4(next, this.points[i], mat);
        vec2.set(temp,
                 (next[0] - prev[0]) / this.scene.cameraAspect[0],
                 (next[1] - prev[1]) / this.scene.cameraAspect[1]);

        this.lengths[i] = Math.sqrt(temp[0]*temp[0] + temp[1]*temp[1]);
        this.offsets[i] = this.offsets[i - 1] + this.lengths[i];
        this.angles[i - 1] = Math.atan2(temp[1], temp[0]);

        vec3.copy(prev, next);
    }

    this.upload();
}

LineMesh.prototype.upload = function() {
    var i, j, right, top, point;

    vertex = 6 * (this.length - 1);

    if (this.data.vertexes == null || (this.data.vertexes.length !== 3 * vertex)) {
        this.data.vertexes = new Float32Array(3 * vertex);
        this.buffers.a_vertex = new GL.Buffer(gl.ARRAY_BUFFER, this.data.vertexes, 3, gl.STATIC_DRAW);
    }

    if (this.data.angles == null || (this.data.angles.length !== vertex)) {
        this.data.angles = new Float32Array(vertex);
        this.buffers.a_angle = new GL.Buffer(gl.ARRAY_BUFFER, this.data.angles, 1, gl.DYNAMIC_DRAW);
    }

    if (this.data.lengths == null || (this.data.lengths.length !== vertex)) {
        this.data.lengths = new Float32Array(vertex);
        this.buffers.a_length = new GL.Buffer(gl.ARRAY_BUFFER, this.data.lengths, 1, gl.DYNAMIC_DRAW);
    }

    if (this.data.offsets == null || (this.data.offsets.length !== vertex)) {
        this.data.offsets = new Float32Array(vertex);
        this.buffers.a_offset = new GL.Buffer(gl.ARRAY_BUFFER, this.data.offsets, 1, gl.DYNAMIC_DRAW);
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
            this.data.vertexes[6*3*i + 3*j + 0] = point[0];
            this.data.vertexes[6*3*i + 3*j + 1] = point[1];
            this.data.vertexes[6*3*i + 3*j + 2] = point[2];

            this.data.angles[6*i + j] = this.angles[i]
                + Math.PI * (top ? 1.0 : -1.0) * (right ? 1.0 : 3.0) / 4;
            this.data.lengths[6*i + j] = this.lengths[i + 1];
            this.data.offsets[6*i + j] = this.offsets[right ? i + 1 : i];

            this.data.positions[6*2*i + 2*j + 0] = right ? this.lengths[i + 1] : 0.0;
            this.data.positions[6*2*i + 2*j + 1] = top ? -this.thickness : this.thickness;
        }
    }

    this.buffers.a_vertex.upload();
    this.buffers.a_angle.upload();
    this.buffers.a_length.upload();
    this.buffers.a_offset.upload();
    this.buffers.a_position.upload();
}

LineMesh.prototype.draw = function(step) {
    this.shader.uniforms({
        u_mvp: this.mvp,
        u_aspect: this.scene.cameraAspect,
        u_far: this.scene.far,

        u_opaque: 0,
        u_prev: 1,

        u_color: this.color,
        u_step: step,
        u_thickness: this.thickness,
        u_antialias: this.antialias,
        u_pattern: this.pattern
    }).drawBuffers(this.buffers, null, gl.TRIANGLES);
}

module.exports = LineMesh;
