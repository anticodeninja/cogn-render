/**
 * A data buffer to be stored in the GPU
 * @class Buffer
 * @constructor
 * @param {Number} target gl.ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
 * @param {ArrayBufferView} data the data in typed-array format
 * @param {number} spacing number of numbers per component (3 per vertex, 2 per uvs...), default 3
 * @param {enum} stream_type default gl.STATIC_DRAW (other: gl.DYNAMIC_DRAW, gl.STREAM_DRAW)
 */
function Buffer(context, target, data, spacing, stream_type) {
    var gl = context.gl;
    
    this.context = context;
    if (this.context.debug) {
	console.log("GL.Buffer created");
    }

    this.buffer = null; //webgl buffer
    this.target = target;

    //optional
    this.data = data;
    this.stream_type = stream_type || gl.STATIC_DRAW;
    this.spacing = spacing || 3;

    if(this.data) {
	this.upload();
    }
}

/**
 * Applies an action to every vertex in this buffer
 * @method forEach
 * @param {function} callback to be called for every vertex (or whatever is contained in the buffer)
 */
Buffer.prototype.forEach = function(callback)
{
    var d = this.data;
    for (var i = 0, s = this.spacing, l = d.length; i < l; i += s)
    {
	callback(d.subarray(i,i+s),i);
    }
    return this; //to concatenate
}

/**
 * Applies a mat4 transform to every triplets in the buffer (assuming they are points)
 * No upload is performed (to ensure efficiency in case there are several operations performed)
 * @method applyTransform
 * @param {mat4} mat
 */
Buffer.prototype.applyTransform = function(mat)
{
    var d = this.data;
    for (var i = 0, s = this.spacing, l = d.length; i < l; i += s)
    {
	var v = d.subarray(i,i+s);
	vec3.transformMat4(v,v,mat);
    }
    return this; //to concatenate
}

/**
 * Uploads the buffer data (stored in this.data) to the GPU
 * @method upload
 */
Buffer.prototype.upload = function() {
    var gl = this.context.gl;

    if (!this.data) {
	throw("No data supplied");
    }

    var data = this.data;
    if (!data.buffer) {
	throw("Buffers must be typed arrays");
    }

    //I store some stuff inside the WebGL buffer instance, it is supported
    this.buffer = this.buffer || gl.createBuffer();
    if (!this.buffer) {
	return; //if the context is lost...
    }

    this.buffer.length = data.length;
    this.buffer.spacing = this.spacing;

    //store the data format
    switch (data.constructor) {
	case Int8Array: this.buffer.gl_type = gl.BYTE; break;
	case Uint8ClampedArray: 
	case Uint8Array: this.buffer.gl_type = gl.UNSIGNED_BYTE; break;
	case Int16Array: this.buffer.gl_type = gl.SHORT; break;
	case Uint16Array: this.buffer.gl_type = gl.UNSIGNED_SHORT; break;
	case Int32Array: this.buffer.gl_type = gl.INT; break;
	case Uint32Array: this.buffer.gl_type = gl.UNSIGNED_INT; break;
	case Float32Array: this.buffer.gl_type = gl.FLOAT; break;
	default: throw("unsupported buffer type");
    }

    gl.bindBuffer(this.target, this.buffer);
    gl.bufferData(this.target, data, this.stream_type);
};

/**
 * Assign data to buffer and uploads it (it allows range)
 * @method setData
 * @param {ArrayBufferView} data in Float32Array format usually
 * @param {number} offset offset in bytes
 */
Buffer.prototype.setData = function( data, offset )
{
    if (!data.buffer) {
	throw("Data must be typed array");
    }
    offset = offset || 0;

    if (!this.data) {
	this.data = data;
	this.upload();
	return;
    } else if(this.data.length < data.length) {
	throw("buffer is not big enough, you cannot set data to a smaller buffer");
    }

    if (this.data != data) {
	if (this.data.length == data.length) {
	    this.data.set(data);
	    this.upload();
	    return;
	}
        
	//upload just part of it
	var new_data_view = new Uint8Array(data.buffer, data.buffer.byteOffset, data.buffer.byteLength);
	var data_view = new Uint8Array(this.data.buffer);
	data_view.set(new_data_view, offset);
	this.uploadRange(offset, new_data_view.length);
    }
};

/**
* Uploads part of the buffer data (stored in this.data) to the GPU
* @method uploadRange
* @param {number} start offset in bytes
* @param {number} size sizes in bytes
*/
Buffer.prototype.uploadRange = function(start, size) {
    var gl = this.context.gl;
    if (!this.data) {
	throw("No data stored in this buffer");
    }

    var data = this.data;
    if (!data.buffer) {
	throw("Buffers must be typed arrays");
    }

    var view = new Uint8Array(this.data.buffer, start, size);

    gl.bindBuffer(this.target, this.buffer);
    gl.bufferSubData(this.target, start, view);
};

module.exports = Buffer;
