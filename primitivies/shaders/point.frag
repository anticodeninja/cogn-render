precision highp float;

uniform float u_antialias;
uniform float u_thickness;

uniform sampler2D u_opaque;
#ifdef LAYER_TRANSPARENT_SUPPLEMENTAL
uniform sampler2D u_prev;
#endif // LAYER_TRANSPARENT_SUPPLEMENTAL
uniform vec2 u_aspect;

varying float v_radius;
varying vec4 v_color;
varying vec4 v_id;
varying vec2 v_pos;

void main() {
#ifdef LAYER_TRANSPARENT
    vec2 texPos = (gl_FragCoord.xy * u_aspect / 2.0);
    float opaqueDepth = texture2D(u_opaque, texPos).r;
    if (gl_FragCoord.z >= opaqueDepth) { discard; return; };
#ifdef LAYER_TRANSPARENT_SUPPLEMENTAL
    float prevDepth = texture2D(u_prev, texPos).r;
    if (gl_FragCoord.z < prevDepth) { discard; return; };
#endif // LAYER_TRANSPARENT_SUPPLEMENTAL
#endif // LAYER_TRANSPARENT

    float full_radius = v_radius + u_thickness;
    float max_radius = full_radius + u_antialias;
    float length2 = v_pos.x * v_pos.x + v_pos.y * v_pos.y;

    if (length2 > max_radius * max_radius) { discard; return; }
    
#ifdef LAYER_ID
    gl_FragColor = v_id;
#else // NOT LAYER_ID
    gl_FragColor = v_color;

    if (length2 > full_radius * full_radius) {
        gl_FragColor.a *= 1.0 - smoothstep(full_radius, max_radius, sqrt(length2));
    }

#ifdef LAYER_OPAQUE
    if (gl_FragColor.a < 1.0) { discard; return; }
#else // NOT LAYER_OPAQUE
    if (gl_FragColor.a == 1.0) { discard; return; }
#endif // NOT LAYER_OPAQUE

    float reduced_radius = v_radius - u_antialias;
    if (length2 > reduced_radius * reduced_radius) {
        gl_FragColor.rgb *= 1.0 - smoothstep(reduced_radius, v_radius, sqrt(length2));
    }
#endif // NOT LAYER_ID
}
