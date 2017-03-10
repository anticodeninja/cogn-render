var core = require("../core/main.js");
var utils = require("../utils/main.js");
var vertShader = require("./shaders/line.vert");
var fragShader = require("./shaders/line.frag");

var SimplexDistanceMesh = function(trans, options) {
    this.constructor.prototype.constructor.call(this, options);

    this.trans = trans;
    this.flatRender = options.flatRender;
    this.length = 0;
    this.edges = this.flatRender ? 3 : 4;
    this.colors = [];
    this.points = [];
    this.angles = [];
    this.lengths = [];

    this.data = {
        vertexes: null,
        colors: null,
        angles: null,
        lengths: null,
        offsets: null,
        positions: null
    };

    this.buffers = {
        a_vertex: null,
        a_color: null,
        a_angle: null,
        a_length: null,
        a_offset: null,
        a_position: null
    };

    this.shaderLayerOpaque = null;
    this.shaderLayerTransparent = null;
    this.shaderLayerTransparentSupplemental = null;
}

SimplexDistanceMesh.prototype = Object.create(core.BaseMesh.prototype);

SimplexDistanceMesh.prototype.setOptions = function(options, initial)
{
    var i;
    
    if (options.colors || initial) {
        this.lineColors = [];
        for (i = 0; i < options.colors.length; ++i) {
            this.lineColors.push(utils.colorToArray(options.colors[i]));
        }
    }

    if (options.thickness || initial) {
        this.thickness = utils.expandDefault(options.thickness, 3);
    }

    if (options.antialias || initial) {
        this.antialias = utils.expandDefault(options.antialias, 2);
    }

    return this;
}

SimplexDistanceMesh.prototype.addPoint = function(value)
{
    var i, j,
        point, temp,
        mul = 1 / (this.edges - 1),
        convert = function(p) {
            return this.flatRender
                ? this.flatRender.to3D(this.trans.toPoint(p))
                : this.trans.toPoint(p);
        }.bind(this);
    
    this.length += 1;

    this.points.push(convert(value));
    for (i = 0; i < this.edges; ++i) {
        point = (this.flatRender ? vec3 : vec4).clone(value);
        temp = point[i];
        for (j = 0; j < this.edges; ++j) {
            point[j] += temp * (i != j ? mul : -1);
        }
        this.points.push(convert(point));
        this.angles.push(0);
        this.lengths.push(0);
    }

    return this;
}

SimplexDistanceMesh.prototype.transform = function(mat)
{
    this.constructor.prototype.transform.call(this, mat);

    var i, j,
        mult = this.edges + 1,
        base = vec3.create(),
        point = vec3.create(),
        temp = vec2.create();

    for (i = 0; i < this.length; ++i) {
        vec3.transformMat4(base, this.points[mult * i], mat);

        for (j = 0; j < this.edges; ++j) {
            vec3.transformMat4(point, this.points[mult * i + j + 1], mat);
            vec2.set(temp,
                     (point[0] - base[0]) / this.scene.cameraAspect[0],
                     (point[1] - base[1]) / this.scene.cameraAspect[1]);
            this.lengths[this.edges * i + j] = Math.sqrt(temp[0]*temp[0] + temp[1]*temp[1]);
            this.angles[this.edges * i + j] = Math.atan2(temp[1], temp[0]);
        }
    }

    this.upload();
}

SimplexDistanceMesh.prototype.upload = function() {
    var context = this.scene.context,
        gl = context.gl,
        i, j, k,
        base, right, top, point;

    vertex = 6 * this.edges * this.length;

    if (this.shaderLayerOpaque == null) {
        this.shaderLayerOpaque = new core.Shader(
            context, vertShader, fragShader, "#define LAYER_OPAQUE;");
    }
    if (this.shaderLayerTransparent == null) {
        this.shaderLayerTransparent = new core.Shader(
            context, vertShader, fragShader, "#define LAYER_TRANSPARENT;");
    }
    if (this.shaderLayerTransparentSupplemental == null) {
        this.shaderLayerTransparentSupplemental = new core.Shader(
            context, vertShader, fragShader, "#define LAYER_TRANSPARENT;\n#define LAYER_TRANSPARENT_SUPPLEMENTAL;");
    }

    if (this.data.vertexes == null || (this.data.vertexes.length !== 3 * vertex)) {
        this.data.vertexes = new Float32Array(3 * vertex);
        this.buffers.a_vertex = new core.Buffer(context, gl.ARRAY_BUFFER, this.data.vertexes, 3, gl.STATIC_DRAW);
    }

    if (this.data.colors == null || (this.data.colors.length !== 4 * vertex)) {
        this.data.colors = new Float32Array(4 * vertex);
        this.buffers.a_color = new core.Buffer(context, gl.ARRAY_BUFFER, this.data.colors, 4, gl.STATIC_DRAW);
    }

    if (this.data.angles == null || (this.data.angles.length !== vertex)) {
        this.data.angles = new Float32Array(vertex);
        this.buffers.a_angle = new core.Buffer(context, gl.ARRAY_BUFFER, this.data.angles, 1, gl.DYNAMIC_DRAW);
    }

    if (this.data.lengths == null || (this.data.lengths.length !== vertex)) {
        this.data.lengths = new Float32Array(vertex);
        this.buffers.a_length = new core.Buffer(context, gl.ARRAY_BUFFER, this.data.lengths, 1, gl.DYNAMIC_DRAW);
    }

    if (this.data.offsets == null || (this.data.offsets.length !== vertex)) {
        this.data.offsets = new Float32Array(vertex);
        this.buffers.a_offset = new core.Buffer(context, gl.ARRAY_BUFFER, this.data.offsets, 1, gl.DYNAMIC_DRAW);
    }

    if (this.data.positions == null || (this.data.positions.length !== 2 * vertex)) {
        this.data.positions = new Float32Array(2 * vertex);
        this.buffers.a_position = new core.Buffer(context, gl.ARRAY_BUFFER, this.data.positions, 2, gl.DYNAMIC_DRAW);
    }

    for (i = 0; i < this.length; ++i) {
        for (j = 0; j < this.edges; ++j) {
            for (k = 0; k < 6; ++k) {
                base = i * this.edges + 6 * j + k;
                top = k == 2 || k == 4 || k == 5;
                right = k == 1 || k == 2 || k == 4;

                point = this.points[right ? i * this.edges + j + 1 : i * this.edges];
                this.data.vertexes[3 * base + 0] = point[0];
                this.data.vertexes[3 * base + 1] = point[1];
                this.data.vertexes[3 * base + 2] = point[2];

                this.data.colors[4 * base + 0] = this.lineColors[j][0];
                this.data.colors[4 * base + 1] = this.lineColors[j][1];
                this.data.colors[4 * base + 2] = this.lineColors[j][2];
                this.data.colors[4 * base + 3] = this.lineColors[j][3];

                this.data.angles[base] = this.angles[i * this.edges + j]
                    + Math.PI * (top ? 1.0 : -1.0) * (right ? 1.0 : 3.0) / 4;
                this.data.lengths[base] = this.lengths[i * this.edges + j];
                this.data.offsets[base] = 0;

                this.data.positions[2 * base + 0] = right ? this.lengths[i * this.edges + j] : 0.0;
                this.data.positions[2 * base + 1] = top ? -this.thickness : this.thickness;
            }
        }
    }

    this.buffers.a_vertex.upload();
    this.buffers.a_color.upload();
    this.buffers.a_angle.upload();
    this.buffers.a_length.upload();
    this.buffers.a_offset.upload();
    this.buffers.a_position.upload();
}

SimplexDistanceMesh.prototype.draw = function(step) {
    var gl = this.scene.context.gl,
        shader;

    if (step == core.Context.LAYER_OPAQUE) {
        shader = this.shaderLayerOpaque;
    } else if (step == core.Context.LAYER_TRANSPARENT) {
        shader = this.shaderLayerTransparent;
    } else if (step == core.Context.LAYER_TRANSPARENT_SUPPLEMENTAL) {
        shader = this.shaderLayerTransparentSupplemental;
    }

    if (!shader) {
        return;
    }
    
    shader.uniforms({
        u_mvp: this.mvp,
        u_aspect: this.scene.cameraAspect,
        u_far: this.scene.far,

        u_opaque: 0,
        u_prev: 1,

        u_color: this.color,
        u_thickness: this.thickness,
        u_antialias: this.antialias,
        u_pattern: this.pattern
    }).drawBuffers(this.buffers, null, gl.TRIANGLES);
}

module.exports = SimplexDistanceMesh;
