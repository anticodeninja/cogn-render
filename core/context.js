'use strict';

var core = require("../core/main.js");

/**
 * creates a new WebGL context (it can create the canvas or use an existing one)
 * @method create
 * @param {Object} options supported are: width, height, canvas
 * @return {gl} gl context for webgl
 */
function Context(options) {
    options = options || {};
    
    var canvas = null;
    if(options.canvas) {
	if(typeof(options.canvas) == "string") {
	    canvas = document.getElementById(options.canvas);
	    if(!canvas) {
                throw("Canvas element not found: " + options.canvas);
            }
	} else {
	    canvas = options.canvas;
        }
    } else {
	var root = null;
	if(options.container) {
	    root = options.container.constructor === String
                ? document.querySelector(options.container)
                : options.container;
        }
        
	if(root && !options.width)
	{
	    var rect = root.getBoundingClientRect();
	    options.width = rect.width;
	    options.height = rect.height;
	}

	canvas = Context.createCanvas(options.width || 800, options.height || 600);
	if (root) {
	    root.appendChild(canvas);
        }
    }
    this.canvas = canvas;

    if (!('alpha' in options)) options.alpha = false;

    var gl;

    if(options.webgl2)
    {
	try { gl = canvas.getContext('webgl2', options); gl.webgl_version = 2; } catch (e) {}
	try { gl = gl || canvas.getContext('experimental-webgl2', options); gl.webgl_version = 2; } catch (e) {}
    } else {
        try { gl = canvas.getContext('webgl', options); } catch (e) {}
        try { gl = gl || canvas.getContext('experimental-webgl', options); } catch (e) {}
    }

    this.gl = gl;
    
    if (!gl) {
        throw 'WebGL not supported';
    }

    if (gl.webgl_version === undefined) {
	gl.webgl_version = 1;
    }

    canvas.is_webgl = true;

    //get some common extensions
    gl.extensions = {};
    gl.extensions["OES_standard_derivatives"] = gl.derivatives_supported = gl.getExtension('OES_standard_derivatives') || false;
    gl.extensions["WEBGL_depth_texture"] = gl.getExtension("WEBGL_depth_texture") || gl.getExtension("WEBKIT_WEBGL_depth_texture") || gl.getExtension("MOZ_WEBGL_depth_texture");
    gl.extensions["OES_element_index_uint"] = gl.getExtension("OES_element_index_uint");
    gl.extensions["WEBGL_draw_buffers"] = gl.getExtension("WEBGL_draw_buffers");
    gl.extensions["EXT_shader_texture_lod"] = gl.getExtension("EXT_shader_texture_lod");
    gl.extensions["EXT_sRGB"] = gl.getExtension("EXT_sRGB");
    gl.extensions["EXT_texture_filter_anisotropic"] = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
    gl.extensions["EXT_frag_depth"] = gl.getExtension("EXT_frag_depth") || gl.getExtension("WEBKIT_EXT_frag_depth") || gl.getExtension("MOZ_EXT_frag_depth");
    gl.extensions["WEBGL_lose_context"] = gl.getExtension("WEBGL_lose_context") || gl.getExtension("WEBKIT_WEBGL_lose_context") || gl.getExtension("MOZ_WEBGL_lose_context");

    //for float textures
    gl.extensions["OES_texture_float_linear"] = gl.getExtension("OES_texture_float_linear");
    if (gl.extensions["OES_texture_float_linear"]) {
        gl.extensions["OES_texture_float"] = gl.getExtension("OES_texture_float");
    }

    gl.extensions["OES_texture_half_float_linear"] = gl.getExtension("OES_texture_half_float_linear");
    if (gl.extensions["OES_texture_half_float_linear"]) {
        gl.extensions["OES_texture_half_float"] = gl.getExtension("OES_texture_half_float");
    }

    gl.HALF_FLOAT_OES = 0x8D61; 
    if (gl.extensions["OES_texture_half_float"]) {
        gl.HALF_FLOAT_OES = gl.extensions["OES_texture_half_float"].HALF_FLOAT_OES;
    }
    gl.HIGH_PRECISION_FORMAT = gl.extensions["OES_texture_half_float"]
        ? gl.HALF_FLOAT_OES
        : (gl.extensions["OES_texture_float"] ? gl.FLOAT : gl.UNSIGNED_BYTE); //because Firefox dont support half float

    this.max_texture_units = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

    this.viewport_data = new Float32Array([0, 0, canvas.width, canvas.height]); //32000 max viewport, I guess its fine

    // var last_click_time = 0;

    this.__screen_quad = {
        a_vertex: new core.Buffer(this,
                                  gl.ARRAY_BUFFER,
                                  new Float32Array([0, 0, 0,   1, 1, 0,   0, 1, 0,
                                                    0, 0, 0,   1, 0, 0,   1, 1, 0]),
                                  3,
                                  gl.STATIC_DRAW),
        a_coord: new core.Buffer(this,
                                  gl.ARRAY_BUFFER,
                                  new Float32Array([0, 0,   1, 1,   0, 1,
                                                    0, 0,   1, 0,   1, 1]),
                                  2,
                                  gl.STATIC_DRAW)
    };
    this.__partial_quad_shader = new core.Shader(this, require("./shaders/quad.vert"), require("./shaders/quad.frag"));

    // /**
    //  * Destroy this WebGL context (removes also the Canvas from the DOM)
    //  * @method destroy
    //  */
    // gl.destroy = function() {
    //     //unbind global events
    //     if(onkey_handler)
    //     {
    //         document.removeEventListener("keydown", onkey_handler );
    //         document.removeEventListener("keyup", onkey_handler );
    //     }

    //     if(this.canvas.parentNode)
    //         this.canvas.parentNode.removeChild(this.canvas);
    //     this.destroyed = true;
    //     if(global.gl == this)
    //         global.gl = null;
    // }

    // //translates touch events in mouseevents
    // function ontouch(e)
    // {
    //     var touches = e.changedTouches,
    //         first = touches[0],
    //         type = "";

    //     //ignore secondary touches
    //     if(e.touches.length && e.changedTouches[0].identifier !== e.touches[0].identifier)
    //         return;
        
    //     if(touches > 1)
    //         return;

    //     switch(e.type)
    //     {
    //         case "touchstart": type = "mousedown"; break;
    //         case "touchmove":  type = "mousemove"; break;        
    //         case "touchend":   type = "mouseup"; break;
    //         default: return;
    //     }

    //     var simulatedEvent = document.createEvent("MouseEvent");
    //     simulatedEvent.initMouseEvent(type, true, true, window, 1,
    //     			      first.screenX, first.screenY,
    //     			      first.clientX, first.clientY, false,
    //     			      false, false, false, 0/*left*/, null);
    //     simulatedEvent.originalEvent = simulatedEvent;
    //     simulatedEvent.is_touch = true;
    //     first.target.dispatchEvent(simulatedEvent);		
    //     e.preventDefault();
    // }

    // function ongesture(e)
    // {
    //     if(gl.ongesture)
    //     { 
    //         e.eventType = e.type;
    //         gl.ongesture(e);
    //     }
    //     event.preventDefault();
    // }

    // var keys = gl.keys = {};

    // /**
    //  * Tells the system to capture key events on the canvas. This will trigger onkey
    //  * @method captureKeys
    //  * @param {boolean} prevent_default prevent default behaviour (like scroll on the web, etc)
    //  * @param {boolean} only_canvas only caches keyboard events if they happen when the canvas is in focus
    //  */
    // var onkey_handler = null;
    // gl.captureKeys = function( prevent_default, only_canvas ) {
    //     if(onkey_handler) 
    //         return;
    //     gl.keys = {};

    //     var target = only_canvas ? gl.canvas : document;

    //     document.addEventListener("keydown", inner );
    //     document.addEventListener("keyup", inner );
    //     function inner(e) { onkey(e, prevent_default); }
    //     onkey_handler = inner;
    // }



    // function onkey(e, prevent_default)
    // {
    //     //trace(e);
    //     e.eventType = e.type; //type cannot be overwritten, so I make a clone to allow me to overwrite

    //     var target_element = e.target.nodeName.toLowerCase();
    //     if(target_element === "input" || target_element === "textarea" || target_element === "select")
    //         return;

    //     e.character = String.fromCharCode(e.keyCode).toLowerCase();
    //     var prev_state = false;
    //     var key = GL.mapKeyCode(e.keyCode);
    //     if(!key) //this key doesnt look like an special key
    //         key = e.character;

    //     //regular key
    //     if (!e.altKey && !e.ctrlKey && !e.metaKey) {
    //         if (key) 
    //     	gl.keys[key] = e.type == "keydown";
    //         prev_state = gl.keys[e.keyCode];
    //         gl.keys[e.keyCode] = e.type == "keydown";
    //     }

    //     //avoid repetition if key stays pressed
    //     if(prev_state != gl.keys[e.keyCode])
    //     {
    //         if(e.type == "keydown" && gl.onkeydown) 
    //     	gl.onkeydown(e);
    //         else if(e.type == "keyup" && gl.onkeyup) 
    //     	gl.onkeyup(e);
    //         LEvent.trigger(gl, e.type, e);
    //     }

    //     if(gl.onkey)
    //         gl.onkey(e);

    //     if(prevent_default && (e.isChar || GL.blockable_keys[e.keyIdentifier || e.key ]) )
    //         e.preventDefault();
    // }

    // //mini textures manager
    // var loading_textures = {};
    // /**
    //  * returns a texture and caches it inside gl.textures[]
    //  * @method loadTexture
    //  * @param {String} url
    //  * @param {Object} options (same options as when creating a texture)
    //  * @param {Function} callback function called once the texture is loaded
    //  * @return {Texture} texture
    //  */
    // gl.loadTexture = function(url, options, on_load)
    // {
    //     if(this.textures[ url ])
    //         return this.textures[url];

    //     if( loading_textures[url] )
    //         return null;

    //     var img = new Image();
    //     img.url = url;
    //     img.onload = function()
    //     {
    //         var texture = GL.Texture.fromImage(this, options);
    //         texture.img = this;
    //         gl.textures[this.url] = texture;
    //         delete loading_textures[this.url];
    //         if(on_load)
    //     	on_load(texture);
    //     } 
    //     img.src = url;
    //     loading_textures[url] = true;
    //     return null;
    // }

    // gl.canvas.addEventListener("webglcontextlost", function(e) {
    //     e.preventDefault();
    //     if(gl.onlosecontext)
    //         gl.onlosecontext(e);
    // }, false);

    this.DEFAULT_TEXTURE_TYPE = gl.UNSIGNED_BYTE;
    this.DEFAULT_TEXTURE_FORMAT = gl.RGBA;
    this.DEFAULT_TEXTURE_MAG_FILTER = gl.LINEAR;
    this.DEFAULT_TEXTURE_MIN_FILTER = gl.LINEAR;
    this.DEFAULT_TEXTURE_WRAP_S = gl.CLAMP_TO_EDGE;
    this.DEFAULT_TEXTURE_WRAP_T = gl.CLAMP_TO_EDGE;

    this.onDraw = new core.Event();
    this.onUpdate = new core.Event();
    this.onMouseDown = new core.Event();
    this.onMouseMove = new core.Event();
    this.onMouseUp = new core.Event();
    this.onMouseWheel = new core.Event();

    //used for render to FBOs
    // Texture.framebuffer = null;
    // Texture.renderbuffer = null;
    // Texture.loading_color = new Uint8Array([0,0,0,0]);
    // Texture.use_renderbuffer_pool = true; //should improve performance

    //Reset state
    this.reset();
}

// GL.mapKeyCode = function(code)
// {
//     var named = {
// 	8: 'BACKSPACE',
// 	9: 'TAB',
// 	13: 'ENTER',
// 	16: 'SHIFT',
// 	17: 'CTRL',
// 	27: 'ESCAPE',
// 	32: 'SPACE',
// 	37: 'LEFT',
// 	38: 'UP',
// 	39: 'RIGHT',
// 	40: 'DOWN'
//     };
//     return named[code] || (code >= 65 && code <= 90 ? String.fromCharCode(code) : null);
// }

Context.prototype.__onMouseEvent = function(e) {
    e.eventType = e.eventType || e.type; //type cannot be overwritten, so I make a clone to allow me to overwrite
    var now = Context.getTime();

    var root_element = e.target || this.context.canvas;
    var border = root_element.getBoundingClientRect();
    
    e.mouseX = e.clientX - border.left;
    e.mouseY = e.clientY - border.top;
    e.canvasX = e.mouseX;
    e.canvasY = border.height - e.mouseY;

    if (e.eventType == "mousedown") {
        this.onMouseDown.fire(e);
    } else if(e.eventType == "mousemove") {
        this.onMouseMove.fire(e);
    } else if(e.eventType == "mouseup") {
        this.onMouseUp.fire(e);
    } else if(e.eventType == "mousewheel" || e.eventType == "wheel") { 
        e.eventType = "mousewheel";
        if (e.type == "wheel") {
    	    e.wheel = -e.deltaY; //in firefox deltaY is 1 while in Chrome is 120
        } else {
    	    e.wheel = (e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60);
        }

        //from stack overflow
        //firefox doesnt have wheelDelta
        e.delta = e.wheelDelta !== undefined ? (e.wheelDelta/40) : (e.deltaY ? -e.deltaY/3 : 0);

        this.onMouseWheel.fire(e);
    }

    if (e.eventType != "mousemove") {
        e.stopPropagation();
    }
    e.preventDefault();
    return false;
}

/**
 * Launch animation loop (calls gl.onupdate and gl.ondraw every frame)
 * example: gl.ondraw = function(){ ... }   or  gl.onupdate = function(dt) { ... }
 * @method animate
 */
Context.prototype.animate = function(v) {
    var gl = this.gl;
    if(v === false)
    {
        global.cancelAnimationFrame(this.__requestFrame_id);
        this.__requestFrame_id = null;
        return;
    }

    var context = this;
    var post = requestAnimationFrame;
    var time = Context.getTime();

    //loop only if browser tab visible
    function loop() {
        if (gl.destroyed) {//to stop rendering once it is destroyed
            return;
        }

        context.__requestFrame_id = post(loop); //do it first, in case it crashes

        var now = Context.getTime();
        var dt = (now - time) * 0.001;

        context.onUpdate.fire(dt);
        context.onDraw.fire();
        
        time = now;
    }
    
    this.__requestFrame_id = post(loop); //launch main loop
}	

/**
 * draws a texture to the viewport
 * @method drawTexture
 * @param {Texture} texture
 * @param {number} x in viewport coordinates 
 * @param {number} y in viewport coordinates 
 * @param {number} w in viewport coordinates 
 * @param {number} h in viewport coordinates 
 * @param {number} tx texture x in texture coordinates
 * @param {number} ty texture y in texture coordinates
 * @param {number} tw texture width in texture coordinates
 * @param {number} th texture height in texture coordinates
 */
Context.prototype.drawTexture = function(texture, x, y, w, h, tx, ty, tw, th, shader, uniforms) {
    var gl = this.gl;

    __pos[0] = x;
    __pos[1] = y;
    if(w === undefined) {
        w = texture.width;
    }
    if(h === undefined) {
        h = texture.height;
    }
    __size[0] = w;
    __size[1] = h;

    if(tx === undefined) tx = 0;
    if(ty === undefined) ty = 0;
    if(tw === undefined) tw = texture.width;
    if(th === undefined) th = texture.height;

    __area[0] = tx / texture.width;
    __area[1] = ty / texture.height;
    __area[2] = (tx + tw) / texture.width;
    __area[3] = (ty + th) / texture.height;

    __viewport[0] = this.viewport_data[2];
    __viewport[1] = this.viewport_data[3];

    shader = shader || this.__partial_quad_shader;

    texture.bind(0);
    shader.uniforms(__uniforms);
    if (uniforms) {
        shader.uniforms(uniforms);
    }
    shader.drawBuffers(this.__screen_quad, null, gl.TRIANGLES);
}


// /**
//  * launches de canvas in fullscreen mode
//  * @method fullscreen
//  */
Context.prototype.fullscreen = function() {
    var requestFullScreen =
        this.canvas.requestFullScreen ||
        this.canvas.webkitRequestFullScreen ||
        this.canvas.mozRequestFullScreen;

    if (requestFullScreen) {
        requestFullScreen();
    } else {
        console.error("Fullscreen not supported");
    }
}

/**
 * returns a canvas with a snapshot of an area
 * this is safer than using the canvas itself due to internals of webgl
 * @method snapshot
 * @param {Number} startx viewport x coordinate
 * @param {Number} starty viewport y coordinate from bottom
 * @param {Number} areax viewport area width
 * @param {Number} areay viewport area height
 * @return {Canvas} canvas
 */
Context.prototype.snapshot = function(startx, starty, areax, areay, skip_reverse)
{
    var canvas = this.createCanvas(areax, areay);
    var ctx = canvas.getContext("2d");
    var pixels = ctx.getImageData(0,0,canvas.width,canvas.height);

    var buffer = new Uint8Array(areax * areay * 4);
    gl.readPixels(startx, starty, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);

    pixels.data.set( buffer );
    ctx.putImageData(pixels,0,0);

    if(skip_reverse)
        return canvas;

    //flip image 
    var final_canvas = createCanvas(areax,areay);
    var ctx = final_canvas.getContext("2d");
    ctx.translate(0,areay);
    ctx.scale(1,-1);
    ctx.drawImage(canvas,0,0);

    return final_canvas;
}

/**
 * use it to reset the the initial gl state
 * @method gl.reset
 */
Context.prototype.reset = function()
{
    //viewport
    this.gl.viewport(0,0, this.canvas.width, this.canvas.height);

    //flags
    this.gl.disable(this.gl.BLEND);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.frontFace(this.gl.CCW);

    //texture
    this._current_texture_drawto = null;
    this._current_fbo_color = null;
    this._current_fbo_depth = null;
}

/**
 * Tells the system to capture mouse events on the canvas. 
 * This will trigger onmousedown, onmousemove, onmouseup, onmousewheel callbacks assigned in the gl context
 * example: gl.onmousedown = function(e){ ... }
 * The event is a regular MouseEvent with some extra parameters
 * @method captureMouse
 * @param {boolean} capture_wheel capture also the mouse wheel
 */
Context.prototype.captureMouse = function(capture_wheel) {
    this.canvas.addEventListener("mousedown", this.__onMouseEvent.bind(this));
    this.canvas.addEventListener("mousemove", this.__onMouseEvent.bind(this));
    this.canvas.addEventListener("mouseup", this.__onMouseEvent.bind(this));
    if(capture_wheel)
    {
        this.canvas.addEventListener("mousewheel", this.__onMouseEvent.bind(this), false);
        this.canvas.addEventListener("wheel", this.__onMouseEvent.bind(this), false);
    }
    //prevent right click context menu
    this.canvas.addEventListener("contextmenu", function(e) { e.preventDefault(); return false; });

    this.canvas.addEventListener("touchstart", this.ontouch, true);
    this.canvas.addEventListener("touchmove", this.ontouch, true);
    this.canvas.addEventListener("touchend", this.ontouch, true);
    this.canvas.addEventListener("touchcancel", this.ontouch, true);   

    this.canvas.addEventListener('gesturestart', this.ongesture);
    this.canvas.addEventListener('gesturechange', this.ongesture);
    this.canvas.addEventListener('gestureend', this.ongesture);
}

Context.prototype.getViewport = function(v) { 
    if (v) {
        v[0] = this.viewport_data[0];
        v[1] = this.viewport_data[1];
        v[2] = this.viewport_data[2];
        v[3] = this.viewport_data[3];
        return v;
    }
    
    return new Float32Array(this.viewport_data);
};

Context.prototype.setViewport = function(v, flip_y) {
    this.viewport_data.set(v);
    if (flip_y) {
        this.viewport_data[1] = this.drawingBufferHeight - v[1] - v[3];
    }
    this.gl.viewport(v[0], this.viewport_data[1], v[2], v[3]);
};

Context.createCanvas = function(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

if (typeof(performance) != "undefined") {
    Context.getTime = performance.now.bind(performance);
} else {
    Context.getTime = Date.now.bind(Date);
}

Context.DEG2RAD = 0.0174532925;
Context.RAD2DEG = 57.295779578552306;
Context.EPSILON = 0.000001;

Context.LAYER_ID = 1;
Context.LAYER_OPAQUE = 100;
Context.LAYER_TRANSPARENT = 200;

var __identity = mat3.create();
var __pos = vec2.create();
var __size = vec2.create();
var __area = vec4.create();
var __white = vec4.fromValues(1,1,1,1);
var __viewport = vec2.create();
var __uniforms = {
    u_texture: 0,
    u_position: __pos,
    u_color: __white,
    u_size: __size,
    u_texture_area: __area,
    u_viewport: __viewport,
    u_transform: __identity
};

module.exports = Context;
