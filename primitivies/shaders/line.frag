precision highp float;

uniform float u_antialias;
uniform float u_thickness;
uniform vec4 u_pattern;

uniform sampler2D u_opaque;
#ifdef LAYER_TRANSPARENT_SUPPLEMENTAL
uniform sampler2D u_prev;
#endif // LAYER_TRANSPARENT_SUPPLEMENTAL
uniform vec2 u_aspect;

varying float v_offset;
varying float v_length;
varying vec2 v_pos;
varying vec4 v_color;

void main() {
#ifdef LAYER_ID
    discard; return;
#else // NOT LAYER_ID
    
#ifdef LAYER_TRANSPARENT
    vec2 texPos = (gl_FragCoord.xy * u_aspect / 2.0);
    float opaqueDepth = texture2D(u_opaque, texPos).r;
    if (gl_FragCoord.z > opaqueDepth) { discard; return; };
#ifdef LAYER_TRANSPARENT_SUPPLEMENTAL
    float prevDepth = texture2D(u_prev, texPos).r;
    if (gl_FragCoord.z <= prevDepth) { discard; return; };
#endif // LAYER_TRANSPARENT_SUPPLEMENTAL
#endif // LAYER_TRANSPARENT

    gl_FragColor = v_color;
    
    // Calculating round koefficient
    float length2 = 0.0;
    if (v_pos.x < 0.0) {
        length2 = v_pos.x * v_pos.x + v_pos.y * v_pos.y;
    } else if (v_pos.x > v_length) {
        length2 = (v_pos.x - v_length) * (v_pos.x - v_length) + v_pos.y * v_pos.y;
    }
    
    float koef_r = 1.0;
    if (length2 > 0.0 && length2 > u_thickness * u_thickness) {
        koef_r = 1.0 - smoothstep(u_thickness, u_thickness + u_antialias, sqrt(length2));
    }
    
    // Calculating pattern koefficient
    float koef_p = 1.0;
    if (u_pattern[3] != 0.0) {
        float offset = mod(v_offset, u_pattern[3]);
        float filled = offset < u_pattern[1] ? u_pattern[0] : u_pattern[2];
        float space = offset < u_pattern[1] ? u_pattern[1] : u_pattern[3];
        
        if (offset < (filled - u_antialias)) {
            koef_p = 1.0;
        } else if (offset < filled) {
            koef_p = 1.0 - smoothstep(filled - u_antialias, filled, offset);
        } else if (offset < (space - u_antialias)) {
            koef_p = 0.0;
        } else {
            koef_p = smoothstep(space - u_antialias, space, offset);
        }
    }
    
    // Calculating edge koefficient
    float koef_e = 1.0 - smoothstep(u_thickness, u_thickness + u_antialias, abs(v_pos.y));
    
    gl_FragColor.a *= koef_r * koef_p * koef_e;
    
#ifdef LAYER_OPAQUE
    if (gl_FragColor.a < 1.0) { discard; return; }
#else // NOT LAYER_OPAQUE
    if (gl_FragColor.a == 1.0) { discard; return; }
#endif // NOT LAYER_OPAQUE

#endif // NOT LAYER_ID
}
